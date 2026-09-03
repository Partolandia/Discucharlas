-- Discucharlas MVP - Row Level Security.
-- Principio: la UI puede esconder cosas, pero quien decide es la base de datos.

-- El rol de invitada NO está autenticado: su acceso se resuelve en el servidor
-- tras validar la clave compartida, nunca dando permisos a `anon`.

alter table public.profiles                 enable row level security;
alter table public.sessions                 enable row level security;
alter table public.session_rsvps            enable row level security;
alter table public.session_bring_selections enable row level security;
alter table public.session_private_notes    enable row level security;
alter table public.session_comments         enable row level security;
alter table public.session_materials        enable row level security;
alter table public.session_ratings          enable row level security;
alter table public.session_attendance       enable row level security;
alter table public.podcast_proposals        enable row level security;
alter table public.voting_rounds            enable row level security;
alter table public.voting_candidates        enable row level security;
alter table public.votes                    enable row level security;
alter table public.community_threads        enable row level security;
alter table public.community_replies        enable row level security;
alter table public.community_reactions      enable row level security;
alter table public.member_requests          enable row level security;
alter table public.member_invitations       enable row level security;
alter table public.guest_access             enable row level security;
alter table public.notifications            enable row level security;
alter table public.email_deliveries         enable row level security;
alter table public.guide_sections           enable row level security;
alter table public.admin_audit_log          enable row level security;

-- ---------------------------------------------------------------------------
-- perfiles
-- ---------------------------------------------------------------------------
-- Email y teléfono solo para la dueña y para administración; el resto del club
-- lee la vista member_directory, que no expone esos campos.
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_self_or_admin on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Rol y estado solo cambian por set_member_role / set_member_status, que
-- protegen la regla de "al menos una administradora activa".
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and coalesce(current_setting('discucharlas.privilege_change', true), '') <> 'on' then
    raise exception 'El rol y el estado se cambian desde Administración > Integrantes' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- ---------------------------------------------------------------------------
-- sesiones
-- ---------------------------------------------------------------------------
-- Los borradores solo existen para administración.
create policy sessions_select on public.sessions
  for select to authenticated
  using (public.is_admin() or (public.is_active_member() and status <> 'draft'));

create policy sessions_admin_write on public.sessions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- participación
-- ---------------------------------------------------------------------------
-- El club ve quién viene y quién lleva qué; cada quien escribe solo lo suyo.
create policy rsvps_select on public.session_rsvps
  for select to authenticated using (public.is_active_member());
create policy rsvps_write_own on public.session_rsvps
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

create policy bring_select on public.session_bring_selections
  for select to authenticated using (public.is_active_member());
create policy bring_write_own on public.session_bring_selections
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

-- Notas privadas: sin excepción de administración. Privado es privado.
create policy private_notes_own_only on public.session_private_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy comments_select on public.session_comments
  for select to authenticated
  using (public.is_active_member() and (deleted_at is null or user_id = auth.uid() or public.is_admin()));
create policy comments_insert_own on public.session_comments
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());
create policy comments_update_own on public.session_comments
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy comments_delete_own_or_admin on public.session_comments
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy materials_select on public.session_materials
  for select to authenticated using (public.is_active_member());
create policy materials_insert_own on public.session_materials
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());
create policy materials_delete_own_or_admin on public.session_materials
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- La calificación individual es personal; el promedio se lee en session_stats.
create policy ratings_select_own_or_admin on public.session_ratings
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy ratings_write_own on public.session_ratings
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

-- Asistencia real: la registra administración, la lee el club.
create policy attendance_select on public.session_attendance
  for select to authenticated using (public.is_active_member());
create policy attendance_admin_write on public.session_attendance
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- propuestas y votación
-- ---------------------------------------------------------------------------
create policy proposals_select on public.podcast_proposals
  for select to authenticated
  using (public.is_admin() or (public.is_active_member() and status <> 'deleted'));
create policy proposals_insert_own on public.podcast_proposals
  for insert to authenticated
  with check (proposed_by = auth.uid() and public.is_active_member());
create policy proposals_update_own_or_admin on public.podcast_proposals
  for update to authenticated
  using ((proposed_by = auth.uid() and status = 'active') or public.is_admin())
  with check ((proposed_by = auth.uid() and status = 'active') or public.is_admin());
create policy proposals_delete_admin on public.podcast_proposals
  for delete to authenticated using (public.is_admin());

create policy rounds_select on public.voting_rounds
  for select to authenticated
  using (public.is_admin() or (public.is_active_member() and status <> 'draft'));
create policy rounds_admin_write on public.voting_rounds
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy candidates_select on public.voting_candidates
  for select to authenticated using (public.is_active_member());
create policy candidates_admin_write on public.voting_candidates
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Cada integrante es dueña de su voto; el conteo se lee en voting_results.
create policy votes_select_own_or_admin on public.votes
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy votes_insert_own_while_open on public.votes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_active_member()
    and exists (select 1 from public.voting_rounds r where r.id = voting_round_id and r.status = 'open')
  );
create policy votes_delete_own_while_open on public.votes
  for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from public.voting_rounds r where r.id = voting_round_id and r.status = 'open')
  );

-- ---------------------------------------------------------------------------
-- comunidad
-- ---------------------------------------------------------------------------
create policy threads_select on public.community_threads
  for select to authenticated
  using (public.is_active_member() and (deleted_at is null or user_id = auth.uid() or public.is_admin()));
create policy threads_insert_own on public.community_threads
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());
create policy threads_update_own_or_admin on public.community_threads
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy threads_delete_own_or_admin on public.community_threads
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy replies_select on public.community_replies
  for select to authenticated
  using (public.is_active_member() and (deleted_at is null or user_id = auth.uid() or public.is_admin()));
create policy replies_insert_own on public.community_replies
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());
create policy replies_update_own_or_admin on public.community_replies
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy replies_delete_own_or_admin on public.community_replies
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy reactions_select on public.community_reactions
  for select to authenticated using (public.is_active_member());
create policy reactions_write_own on public.community_reactions
  for all to authenticated
  using (user_id = auth.uid() and public.is_active_member())
  with check (user_id = auth.uid() and public.is_active_member());

-- ---------------------------------------------------------------------------
-- acceso y membresía
-- ---------------------------------------------------------------------------
create policy member_requests_select on public.member_requests
  for select to authenticated using (proposed_by = auth.uid() or public.is_admin());
create policy member_requests_insert_own on public.member_requests
  for insert to authenticated
  with check (proposed_by = auth.uid() and public.is_active_member());
create policy member_requests_admin_write on public.member_requests
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Invitaciones y clave de invitadas contienen material sensible: solo admin.
create policy invitations_admin_only on public.member_invitations
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy guest_access_admin_only on public.guest_access
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- notificaciones, email, guía y bitácora
-- ---------------------------------------------------------------------------
create policy notifications_own on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy notifications_mark_read_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy email_deliveries_admin on public.email_deliveries
  for select to authenticated using (public.is_admin());

create policy guide_select on public.guide_sections
  for select to authenticated using (public.is_active_member());
create policy guide_admin_write on public.guide_sections
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy audit_admin_select on public.admin_audit_log
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- privilegios de tabla: `anon` no toca nada del club
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

revoke all on public.member_invitations from authenticated;
grant select, insert, update on public.member_invitations to authenticated;
revoke all on public.admin_audit_log from authenticated;
grant select on public.admin_audit_log to authenticated;
revoke all on public.email_deliveries from authenticated;
grant select on public.email_deliveries to authenticated;

revoke all on all sequences in schema public from anon;
grant usage, select on all sequences in schema public to authenticated;
