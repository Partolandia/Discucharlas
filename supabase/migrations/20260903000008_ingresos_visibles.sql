-- Ingresos de integrantes: el enlace se puede volver a ver.
--
-- Hasta ahora solo guardábamos el hash, así que el enlace se mostraba una vez y
-- si se perdía había que emitir otro. El prototipo lo muestra siempre, con
-- "Copiar enlace" al lado, porque administración lo comparte a mano por el
-- canal que sea. Guardamos el token en claro para poder reconstruirlo.
--
-- Es material sensible, pero la tabla ya era de solo administración
-- (`invitations_admin_only`) y el canje sigue comprobándose contra `token_hash`.
alter table public.member_invitations
  add column if not exists token text;

comment on column public.member_invitations.token is
  'Token en claro para poder volver a mostrar el enlace. Solo lo lee administración; el canje valida token_hash.';

-- Administración solo escribe el nombre: el correo lo pone la propia persona al
-- crear su cuenta, que es quien lo conoce.
alter table public.member_invitations
  alter column invitee_email drop not null;

-- La vista congeló la lista de columnas el día que se creó, así que `token` no
-- aparecería por más que esté en la tabla. Hay que rehacerla, no reemplazarla:
-- la columna nueva cae en medio y eso `create or replace` no lo admite.
drop view if exists public.invitation_status;

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
