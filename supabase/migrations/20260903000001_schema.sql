-- Discucharlas MVP - esquema base
-- Club único. Identidad de auth vive en auth.users; el perfil de aplicación en public.profiles.

create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- utilidades
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  first_name          text not null,
  last_name           text not null default '',
  email               text not null,
  phone               text,
  birthday_day        smallint check (birthday_day between 1 and 31),
  birthday_month      smallint check (birthday_month between 1 and 12),
  bio                 text,
  interests           text,
  avatar_path         text,
  role                text not null default 'member' check (role in ('member','admin')),
  status              text not null default 'active' check (status in ('active','suspended')),
  email_notifications boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role) where status = 'active';
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- sessions (discucharlas)
-- ---------------------------------------------------------------------------
create sequence public.session_human_id_seq;

create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  human_id      text not null unique default 'DC-' || lpad(nextval('public.session_human_id_seq')::text, 4, '0'),
  episode_title text not null,
  podcast_name  text not null,
  episode_url   text,
  image_path    text,
  date          date,
  start_time    time,
  end_time      time,
  place         text,
  status        text not null default 'draft' check (status in ('draft','upcoming','past','cancelled')),
  summary       text,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Regla de negocio: como máximo una discucharla en estado "upcoming".
create unique index sessions_single_upcoming_idx on public.sessions ((status)) where status = 'upcoming';
create index sessions_status_date_idx on public.sessions (status, date desc);
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- participación por sesión
-- ---------------------------------------------------------------------------
create table public.session_rsvps (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  response   text not null check (response in ('yes','maybe','no')),
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
create trigger session_rsvps_touch before update on public.session_rsvps
  for each row execute function public.touch_updated_at();

create table public.session_bring_selections (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  category   text not null check (category in ('bebida','fruta','botana_salada','botana_dulce','ensalada','pan','otro')),
  detail     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id, category)
);
create trigger session_bring_touch before update on public.session_bring_selections
  for each row execute function public.touch_updated_at();

-- Nota privada: propiedad exclusiva de la integrante. Nunca legible por administración.
create table public.session_private_notes (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  note       text not null default '',
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
create trigger session_private_notes_touch before update on public.session_private_notes
  for each row execute function public.touch_updated_at();

create table public.session_comments (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index session_comments_session_idx on public.session_comments (session_id, created_at);
create trigger session_comments_touch before update on public.session_comments
  for each row execute function public.touch_updated_at();

create table public.session_materials (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in ('link','image','file')),
  title        text not null,
  url_or_path  text not null,
  mime_type    text,
  created_at   timestamptz not null default now()
);
create index session_materials_session_idx on public.session_materials (session_id, created_at);

create table public.session_ratings (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
create trigger session_ratings_touch before update on public.session_ratings
  for each row execute function public.touch_updated_at();

-- Asistencia real: registro administrativo, puede diferir del RSVP.
create table public.session_attendance (
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  present     boolean not null default false,
  recorded_by uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now(),
  primary key (session_id, user_id)
);
create trigger session_attendance_touch before update on public.session_attendance
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- propuestas y votación
-- ---------------------------------------------------------------------------
create table public.podcast_proposals (
  id            uuid primary key default gen_random_uuid(),
  proposed_by   uuid references public.profiles(id) on delete set null,
  episode_title text not null,
  podcast_name  text not null,
  episode_url   text,
  duration      text,
  description   text,
  image_path    text,
  status        text not null default 'active' check (status in ('active','suspended','used','deleted')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index podcast_proposals_status_idx on public.podcast_proposals (status, created_at desc);
create trigger podcast_proposals_touch before update on public.podcast_proposals
  for each row execute function public.touch_updated_at();

create table public.voting_rounds (
  id                  uuid primary key default gen_random_uuid(),
  title               text,
  status              text not null default 'draft' check (status in ('draft','open','closed')),
  opened_by           uuid references public.profiles(id) on delete set null,
  opened_at           timestamptz,
  closes_at           timestamptz,
  closed_at           timestamptz,
  closed_by           uuid references public.profiles(id) on delete set null,
  winning_proposal_id uuid references public.podcast_proposals(id) on delete set null,
  override_by         uuid references public.profiles(id) on delete set null,
  override_note       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
-- Regla de negocio: una sola votación activa a la vez.
create unique index voting_rounds_single_open_idx on public.voting_rounds ((status)) where status = 'open';
create unique index voting_rounds_single_draft_idx on public.voting_rounds ((status)) where status = 'draft';
create trigger voting_rounds_touch before update on public.voting_rounds
  for each row execute function public.touch_updated_at();

create table public.voting_candidates (
  voting_round_id uuid not null references public.voting_rounds(id) on delete cascade,
  proposal_id     uuid not null references public.podcast_proposals(id) on delete cascade,
  added_by        uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  primary key (voting_round_id, proposal_id)
);

create table public.votes (
  voting_round_id uuid not null references public.voting_rounds(id) on delete cascade,
  proposal_id     uuid not null references public.podcast_proposals(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (voting_round_id, proposal_id, user_id),
  foreign key (voting_round_id, proposal_id)
    references public.voting_candidates (voting_round_id, proposal_id) on delete cascade
);
create index votes_round_idx on public.votes (voting_round_id);

-- ---------------------------------------------------------------------------
-- comunidad
-- ---------------------------------------------------------------------------
create table public.community_threads (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index community_threads_created_idx on public.community_threads (created_at desc);
create trigger community_threads_touch before update on public.community_threads
  for each row execute function public.touch_updated_at();

create table public.community_replies (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.community_threads(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index community_replies_thread_idx on public.community_replies (thread_id, created_at);
create trigger community_replies_touch before update on public.community_replies
  for each row execute function public.touch_updated_at();

-- Solo reacciones positivas (corazón). Sin "no me gusta" por decisión de producto.
create table public.community_reactions (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid references public.community_threads(id) on delete cascade,
  reply_id      uuid references public.community_replies(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null default 'heart' check (reaction_type = 'heart'),
  created_at    timestamptz not null default now(),
  constraint community_reactions_one_target check (num_nonnulls(thread_id, reply_id) = 1)
);
create unique index community_reactions_thread_uniq on public.community_reactions (thread_id, user_id) where thread_id is not null;
create unique index community_reactions_reply_uniq on public.community_reactions (reply_id, user_id) where reply_id is not null;

-- ---------------------------------------------------------------------------
-- acceso y membresía
-- ---------------------------------------------------------------------------
create table public.member_requests (
  id                    uuid primary key default gen_random_uuid(),
  proposed_by           uuid references public.profiles(id) on delete set null,
  invitee_name          text not null,
  invitee_email         text,
  note                  text,
  status                text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by           uuid references public.profiles(id) on delete set null,
  reviewed_at           timestamptz,
  created_at            timestamptz not null default now()
);

create table public.member_invitations (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid references public.member_requests(id) on delete set null,
  invitee_name  text not null,
  invitee_email text not null,
  token_hash    text not null unique,
  status        text not null default 'unused' check (status in ('unused','used','revoked')),
  created_by    uuid references public.profiles(id) on delete set null,
  used_by       uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  used_at       timestamptz,
  revoked_at    timestamptz
);

-- Clave compartida de invitadas. Se espera una sola activa.
create table public.guest_access (
  id         uuid primary key default gen_random_uuid(),
  code_hash  text not null,
  label      text,
  status     text not null default 'active' check (status in ('active','revoked')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index guest_access_single_active_idx on public.guest_access ((status)) where status = 'active';

-- ---------------------------------------------------------------------------
-- notificaciones, email y guía
-- ---------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  entity_type text,
  entity_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.email_deliveries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  recipient_email text not null,
  type            text not null,
  provider_id     text,
  status          text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  error           text,
  entity_type     text,
  entity_id       uuid,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);

create table public.guide_sections (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  title      text not null,
  body       text not null default '',
  sort_order integer not null default 0,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
create trigger guide_sections_touch before update on public.guide_sections
  for each row execute function public.touch_updated_at();

-- Registro ligero de acciones administrativas sensibles (quién, qué, cuándo).
create table public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  detail      jsonb,
  created_at  timestamptz not null default now()
);
create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
