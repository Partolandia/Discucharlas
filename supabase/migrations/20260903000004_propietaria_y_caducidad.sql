-- Decisiones de club cerradas el 3 de septiembre de 2026:
--   1. Sí existe un rol de propietaria, distinto de las demás administradoras.
--   2. Las invitaciones caducan un día antes de la próxima discucharla.

-- ---------------------------------------------------------------------------
-- ajustes del club (una sola fila)
-- ---------------------------------------------------------------------------
create table public.club_settings (
  id                        boolean primary key default true check (id),
  timezone                  text not null default 'America/Mexico_City',
  -- Días de antelación con que caduca una invitación respecto de la próxima
  -- discucharla. La invitación deja de servir al empezar ese día.
  invitation_expiry_days_before smallint not null default 1,
  -- Respaldo cuando todavía no hay una discucharla próxima agendada.
  invitation_fallback_days  smallint not null default 15,
  updated_at                timestamptz not null default now()
);
insert into public.club_settings (id) values (true);

alter table public.club_settings enable row level security;
create policy club_settings_read on public.club_settings
  for select to authenticated using (public.is_active_member());
create policy club_settings_admin_write on public.club_settings
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
revoke all on public.club_settings from anon;
grant select, update on public.club_settings to authenticated;

-- ---------------------------------------------------------------------------
-- propietaria
-- ---------------------------------------------------------------------------
-- La propietaria es una administradora con salvaguardas extra: nadie puede
-- quitarle el rol ni suspenderla, y solo ella puede transferir la propiedad.
alter table public.profiles add column is_owner boolean not null default false;
create unique index profiles_una_propietaria_idx on public.profiles ((is_owner)) where is_owner;

-- La propiedad solo se mueve con transfer_ownership, igual que el rol y el estado.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.is_owner is distinct from old.is_owner)
     and coalesce(current_setting('discucharlas.privilege_change', true), '') <> 'on' then
    raise exception 'El rol, el estado y la propiedad se cambian desde Administración > Integrantes'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_owner and status = 'active'
  );
$$;

create or replace function public.transfer_ownership(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target public.profiles;
  actual uuid;
begin
  if not public.is_owner() then
    raise exception 'Solo la propietaria puede transferir la propiedad del club' using errcode = '42501';
  end if;

  select * into target from public.profiles where id = target_id for update;
  if not found or target.status <> 'active' then
    raise exception 'La nueva propietaria debe ser una integrante activa' using errcode = '22023';
  end if;

  select id into actual from public.profiles where is_owner;
  if actual = target_id then
    return;
  end if;

  perform set_config('discucharlas.privilege_change', 'on', true);
  update public.profiles set is_owner = false where id = actual;
  -- La propietaria es siempre administradora.
  update public.profiles set is_owner = true, role = 'admin' where id = target_id;
  perform set_config('discucharlas.privilege_change', 'off', true);

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'transfer_ownership', 'profile', target_id,
          jsonb_build_object('from', actual, 'to', target_id));
end;
$$;

-- Las salvaguardas de la propietaria se suman a las reglas ya existentes.
create or replace function public.set_member_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target public.profiles;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if new_role not in ('member', 'admin') then
    raise exception 'Rol inválido' using errcode = '22023';
  end if;

  select * into target from public.profiles where id = target_id for update;
  if not found then
    raise exception 'La integrante no existe' using errcode = 'P0002';
  end if;
  if target.status <> 'active' then
    raise exception 'Solo se puede cambiar el rol de una integrante activa' using errcode = '22023';
  end if;
  if target.role = new_role then
    return;
  end if;

  if target.is_owner and new_role = 'member' then
    raise exception 'La propietaria del club no puede dejar de ser administradora. Transfiere la propiedad primero.'
      using errcode = 'P0001';
  end if;

  if target.role = 'admin' and new_role = 'member' and public.active_admin_count() <= 1 then
    raise exception 'El club debe conservar al menos una administradora activa' using errcode = 'P0001';
  end if;

  perform set_config('discucharlas.privilege_change', 'on', true);
  update public.profiles set role = new_role where id = target_id;
  perform set_config('discucharlas.privilege_change', 'off', true);

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'set_member_role', 'profile', target_id,
          jsonb_build_object('from', target.role, 'to', new_role));
end;
$$;

create or replace function public.set_member_status(target_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target public.profiles;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if new_status not in ('active', 'suspended') then
    raise exception 'Estado inválido' using errcode = '22023';
  end if;

  select * into target from public.profiles where id = target_id for update;
  if not found then
    raise exception 'La integrante no existe' using errcode = 'P0002';
  end if;
  if target.status = new_status then
    return;
  end if;

  if target.is_owner and new_status = 'suspended' then
    raise exception 'La propietaria del club no puede ser suspendida. Transfiere la propiedad primero.'
      using errcode = 'P0001';
  end if;
  if new_status = 'suspended' and target.role = 'admin' then
    raise exception 'Retira el rol de administradora antes de suspender esta cuenta' using errcode = 'P0001';
  end if;

  perform set_config('discucharlas.privilege_change', 'on', true);
  update public.profiles set status = new_status where id = target_id;
  perform set_config('discucharlas.privilege_change', 'off', true);

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'set_member_status', 'profile', target_id,
          jsonb_build_object('from', target.status, 'to', new_status));
end;
$$;

-- ---------------------------------------------------------------------------
-- caducidad de invitaciones
-- ---------------------------------------------------------------------------
alter table public.member_invitations add column expires_at timestamptz;

-- Una invitación deja de servir al empezar el día previo a la próxima
-- discucharla; es decir, sirve durante todo el antepenúltimo día.
-- Si todavía no hay discucharla agendada, cae al respaldo de 15 días.
create or replace function public.default_invitation_expiry()
returns timestamptz
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      select ((s.date - c.invitation_expiry_days_before)::timestamp at time zone c.timezone)
      from public.sessions s, public.club_settings c
      where s.status = 'upcoming' and s.date is not null
      limit 1
    ),
    now() + (select invitation_fallback_days from public.club_settings) * interval '1 day'
  );
$$;

alter table public.member_invitations
  alter column expires_at set default public.default_invitation_expiry();

-- Estado efectivo de cada invitación, con la caducidad ya resuelta.
create view public.invitation_status
with (security_invoker = false) as
  select
    i.*,
    case
      when i.status <> 'unused' then i.status
      when i.expires_at is not null and i.expires_at <= now() then 'expired'
      else 'unused'
    end as effective_status
  from public.member_invitations i
  where public.is_admin();

grant select on public.invitation_status to authenticated;
grant execute on function public.is_owner(), public.transfer_ownership(uuid),
  public.default_invitation_expiry() to authenticated;
