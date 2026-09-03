-- Discucharlas MVP - funciones de negocio, vistas derivadas y guardas transaccionales.

-- ---------------------------------------------------------------------------
-- helpers de autorización (SECURITY DEFINER para no recursar sobre profiles RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active' and role = 'admin'
  );
$$;

create or replace function public.active_admin_count()
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::int from public.profiles where role = 'admin' and status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- alta de perfil al crearse el usuario en auth
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- directorio del club: campos públicos del perfil, sin email ni teléfono
-- ---------------------------------------------------------------------------
create view public.member_directory
with (security_invoker = false) as
  select
    p.id,
    p.first_name,
    p.last_name,
    p.bio,
    p.interests,
    p.avatar_path,
    p.role,
    p.status,
    p.birthday_day,
    p.birthday_month,
    p.created_at
  from public.profiles p
  where p.status = 'active'
    and public.is_active_member();

-- ---------------------------------------------------------------------------
-- valores derivados
-- ---------------------------------------------------------------------------
create view public.session_stats
with (security_invoker = false) as
  select
    s.id as session_id,
    (select round(avg(r.rating)::numeric, 1) from public.session_ratings r where r.session_id = s.id) as average_rating,
    (select count(*) from public.session_ratings r where r.session_id = s.id) as rating_count,
    (select count(*) from public.session_comments c where c.session_id = s.id and c.deleted_at is null) as comment_count,
    (select count(*) from public.session_attendance a where a.session_id = s.id and a.present) as attendee_count,
    (select count(*) from public.session_rsvps v where v.session_id = s.id and v.response = 'yes') as rsvp_yes_count
  from public.sessions s
  where public.is_active_member();

-- Conteo de votos por candidatura, sin exponer quién votó qué.
create view public.voting_results
with (security_invoker = false) as
  select
    c.voting_round_id,
    c.proposal_id,
    (select count(*) from public.votes v
      where v.voting_round_id = c.voting_round_id and v.proposal_id = c.proposal_id) as vote_count
  from public.voting_candidates c
  where public.is_active_member();

-- ---------------------------------------------------------------------------
-- gobernanza de roles: el club nunca puede quedarse sin administradora activa
-- ---------------------------------------------------------------------------
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

  -- Quitar el rol admin solo si queda al menos otra administradora activa.
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

  -- Hay que retirar el rol de administradora antes de suspender la cuenta.
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
-- notificaciones internas
-- ---------------------------------------------------------------------------
create or replace function public.notify_all_members(
  p_type text,
  p_title text,
  p_body text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_exclude uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  select p.id, p_type, p_title, p_body, p_entity_type, p_entity_id
  from public.profiles p
  where p.status = 'active' and (p_exclude is null or p.id <> p_exclude);

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

-- ---------------------------------------------------------------------------
-- sesiones
-- ---------------------------------------------------------------------------
create or replace function public.activate_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing_id uuid;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select id into existing_id
  from public.sessions
  where status = 'upcoming' and id <> p_session_id
  limit 1;

  if existing_id is not null then
    raise exception 'Ya hay una discucharla próxima. Márcala como realizada o cancélala antes de activar otra.'
      using errcode = 'P0001';
  end if;

  update public.sessions set status = 'upcoming' where id = p_session_id;

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'activate_session', 'session', p_session_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- votación
-- ---------------------------------------------------------------------------
create or replace function public.open_voting_round(p_round_id uuid, p_closes_at timestamptz default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  candidate_count integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if exists (select 1 from public.voting_rounds where status = 'open' and id <> p_round_id) then
    raise exception 'Ya hay una votación activa. Ciérrala antes de abrir otra.' using errcode = 'P0001';
  end if;

  select count(*) into candidate_count from public.voting_candidates where voting_round_id = p_round_id;
  if candidate_count < 2 then
    raise exception 'Elige al menos dos candidaturas antes de abrir la votación.' using errcode = 'P0001';
  end if;

  update public.voting_rounds
  set status = 'open', opened_by = auth.uid(), opened_at = now(), closes_at = p_closes_at
  where id = p_round_id;

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'open_voting_round', 'voting_round', p_round_id);
end;
$$;

-- Cierra la votación. Si hay empate y no se indica override, falla pidiendo
-- que una administradora resuelva explícitamente.
create or replace function public.close_voting_round(
  p_round_id uuid,
  p_override_proposal_id uuid default null,
  p_override_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  winner uuid;
  top_votes integer;
  tied integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if not exists (select 1 from public.voting_rounds where id = p_round_id and status = 'open') then
    raise exception 'Esta votación no está activa.' using errcode = 'P0001';
  end if;

  if p_override_proposal_id is not null then
    if not exists (
      select 1 from public.voting_candidates
      where voting_round_id = p_round_id and proposal_id = p_override_proposal_id
    ) then
      raise exception 'La propuesta elegida no es candidata de esta votación.' using errcode = '22023';
    end if;
    winner := p_override_proposal_id;
  else
    select max(vote_count) into top_votes
    from (
      select count(v.*) as vote_count
      from public.voting_candidates c
      left join public.votes v
        on v.voting_round_id = c.voting_round_id and v.proposal_id = c.proposal_id
      where c.voting_round_id = p_round_id
      group by c.proposal_id
    ) counts;

    if coalesce(top_votes, 0) = 0 then
      raise exception 'Todavía no hay votos. Resuelve la votación eligiendo una candidatura.' using errcode = 'P0001';
    end if;

    select count(*), min(proposal_id) into tied, winner
    from (
      select c.proposal_id, count(v.*) as vote_count
      from public.voting_candidates c
      left join public.votes v
        on v.voting_round_id = c.voting_round_id and v.proposal_id = c.proposal_id
      where c.voting_round_id = p_round_id
      group by c.proposal_id
    ) counts
    where vote_count = top_votes;

    if tied > 1 then
      raise exception 'Hay un empate. Elige la candidatura ganadora para cerrar la votación.' using errcode = 'P0001';
    end if;
  end if;

  update public.voting_rounds
  set status = 'closed',
      closed_at = now(),
      closed_by = auth.uid(),
      winning_proposal_id = winner,
      override_by = case when p_override_proposal_id is not null then auth.uid() end,
      override_note = p_override_note
  where id = p_round_id;

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'close_voting_round', 'voting_round', p_round_id,
          jsonb_build_object('winner', winner, 'override', p_override_proposal_id is not null, 'note', p_override_note));

  return winner;
end;
$$;

-- ---------------------------------------------------------------------------
-- permisos de ejecución
-- ---------------------------------------------------------------------------
grant select on public.member_directory, public.session_stats, public.voting_results to authenticated;

grant execute on function
  public.is_active_member(),
  public.is_admin(),
  public.active_admin_count(),
  public.set_member_role(uuid, text),
  public.set_member_status(uuid, text),
  public.notify_all_members(text, text, text, text, uuid, uuid),
  public.activate_session(uuid),
  public.open_voting_round(uuid, timestamptz),
  public.close_voting_round(uuid, uuid, text)
to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
