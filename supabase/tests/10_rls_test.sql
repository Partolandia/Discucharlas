-- Pruebas de aislamiento de datos y reglas de negocio del MVP.
-- Cada aserción falla ruidosamente si una regla del PRD deja de cumplirse.

create schema if not exists tests;

create or replace function tests.assert(cond boolean, msg text)
returns void language plpgsql as $$
begin
  if not cond then raise exception 'FALLA: %', msg; end if;
  raise notice 'ok   %', msg;
end $$;

-- Consulta escalar suplantando a una usuaria autenticada (RLS activo).
create or replace function tests.as_user(p_user uuid, p_sql text)
returns integer language plpgsql as $$
declare n integer;
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute p_sql into n;
  perform set_config('role', 'postgres', true);
  return n;
end $$;

-- true si la sentencia fue rechazada al ejecutarse como esa usuaria.
create or replace function tests.denied(p_user uuid, p_sql text)
returns boolean language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute p_sql;
  perform set_config('role', 'postgres', true);
  return false;
exception when others then
  perform set_config('role', 'postgres', true);
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- fixtures
-- ---------------------------------------------------------------------------
do $$
declare
  ana uuid; bea uuid; cris uuid; dani uuid;
  s_up uuid; s_draft uuid;
  p1 uuid; p2 uuid; round1 uuid;
begin
  insert into auth.users (email, raw_user_meta_data) values
    ('ana@discucharlas.mx',  '{"first_name":"Ana","last_name":"R","phone":"+52551"}'),
    ('bea@discucharlas.mx',  '{"first_name":"Bea","last_name":"L","phone":"+52552"}'),
    ('cris@discucharlas.mx', '{"first_name":"Cris","last_name":"M","phone":"+52553"}'),
    ('dani@discucharlas.mx', '{"first_name":"Dani","last_name":"S","phone":"+52554"}');

  select id into ana  from auth.users where email = 'ana@discucharlas.mx';
  select id into bea  from auth.users where email = 'bea@discucharlas.mx';
  select id into cris from auth.users where email = 'cris@discucharlas.mx';
  select id into dani from auth.users where email = 'dani@discucharlas.mx';

  perform set_config('discucharlas.privilege_change', 'on', true);
  update public.profiles set role = 'admin' where id in (ana, bea);
  perform set_config('discucharlas.privilege_change', 'off', true);

  insert into public.sessions (episode_title, podcast_name, date, place, status, created_by)
  values ('El fin del amor', 'Radio Ambulante', current_date + 7, 'Casa de Ana', 'upcoming', ana)
  returning id into s_up;

  insert into public.sessions (episode_title, podcast_name, status, created_by)
  values ('Borrador interno', 'Podcast X', 'draft', ana)
  returning id into s_draft;

  insert into public.session_private_notes (session_id, user_id, note)
  values (s_up, cris, 'Me recordó a mi abuela. No compartir.');

  insert into public.podcast_proposals (proposed_by, episode_title, podcast_name)
  values (cris, 'Las mujeres que cantaban', 'Casa Vieja') returning id into p1;
  insert into public.podcast_proposals (proposed_by, episode_title, podcast_name)
  values (dani, 'Cuando el mar suena', 'Mar Abierto') returning id into p2;

  insert into public.voting_rounds (status) values ('open') returning id into round1;
  insert into public.voting_candidates (voting_round_id, proposal_id) values (round1, p1), (round1, p2);
  insert into public.votes (voting_round_id, proposal_id, user_id) values (round1, p1, cris);

  -- guardar ids para las aserciones
  create table if not exists tests.ids (k text primary key, v uuid);
  insert into tests.ids values
    ('ana', ana), ('bea', bea), ('cris', cris), ('dani', dani),
    ('s_up', s_up), ('s_draft', s_draft), ('p1', p1), ('p2', p2), ('round1', round1)
  on conflict (k) do update set v = excluded.v;
end $$;

-- ---------------------------------------------------------------------------
-- aserciones
-- ---------------------------------------------------------------------------
do $$
declare
  ana uuid  := (select v from tests.ids where k = 'ana');
  bea uuid  := (select v from tests.ids where k = 'bea');
  cris uuid := (select v from tests.ids where k = 'cris');
  dani uuid := (select v from tests.ids where k = 'dani');
  s_up uuid := (select v from tests.ids where k = 's_up');
  round1 uuid := (select v from tests.ids where k = 'round1');
  p2 uuid   := (select v from tests.ids where k = 'p2');
begin
  raise notice '--- perfiles y directorio ---';
  perform tests.assert((select count(*) from public.profiles) = 4,
    'el trigger de auth crea un perfil por usuaria');
  perform tests.assert(tests.as_user(cris, 'select count(*) from public.member_directory') = 4,
    'una integrante ve el directorio completo del club');
  perform tests.assert(
    not exists (select 1 from information_schema.columns
                where table_name = 'member_directory' and column_name in ('email','phone')),
    'el directorio no expone email ni telefono');
  perform tests.assert(tests.as_user(cris, format('select count(*) from public.profiles where id = %L', dani)) = 0,
    'una integrante no puede leer el perfil completo (email/telefono) de otra');
  perform tests.assert(tests.as_user(ana, format('select count(*) from public.profiles where id = %L', dani)) = 1,
    'administracion si puede leer datos de contacto para operar el club');

  raise notice '--- notas privadas ---';
  perform tests.assert(tests.as_user(cris, 'select count(*) from public.session_private_notes') = 1,
    'la duena ve su nota privada');
  perform tests.assert(tests.as_user(dani, 'select count(*) from public.session_private_notes') = 0,
    'otra integrante NO ve la nota privada');
  perform tests.assert(tests.as_user(ana, 'select count(*) from public.session_private_notes') = 0,
    'administracion NO ve la nota privada');

  raise notice '--- roles y gobernanza ---';
  perform tests.assert(
    tests.denied(cris, format('update public.profiles set role = ''admin'' where id = %L', cris)),
    'una integrante no puede auto-promoverse a administradora');
  perform tests.assert(
    tests.denied(cris, format('select public.set_member_role(%L, ''admin'')', cris)),
    'set_member_role rechaza a quien no es administradora');
  perform tests.assert(
    not tests.denied(ana, format('select public.set_member_role(%L, ''member'')', bea)),
    'una administradora puede revocar el rol de otra si queda al menos una');
  perform tests.assert(public.active_admin_count() = 1, 'queda una sola administradora activa');
  perform tests.assert(
    tests.denied(ana, format('select public.set_member_role(%L, ''member'')', ana)),
    'el club no puede quedarse sin administradora activa');
  perform tests.assert(
    tests.denied(ana, format('select public.set_member_status(%L, ''suspended'')', ana)),
    'no se suspende una cuenta que todavia tiene rol de administradora');

  raise notice '--- sesiones ---';
  perform tests.assert(tests.as_user(cris, 'select count(*) from public.sessions') = 1,
    'una integrante no ve los borradores');
  perform tests.assert(tests.as_user(ana, 'select count(*) from public.sessions') = 2,
    'administracion si ve los borradores');
  perform tests.assert(
    tests.denied(ana, 'insert into public.sessions (episode_title, podcast_name, status) values (''Otra'',''Y'',''upcoming'')'),
    'solo puede haber una discucharla proxima a la vez');
  perform tests.assert(
    tests.denied(cris, 'insert into public.sessions (episode_title, podcast_name) values (''Mia'',''Z'')'),
    'una integrante no puede crear discucharlas');

  raise notice '--- votacion ---';
  perform tests.assert(tests.as_user(cris, 'select count(*) from public.votes') = 1,
    'cada integrante ve su propio voto');
  perform tests.assert(tests.as_user(dani, 'select count(*) from public.votes') = 0,
    'una integrante NO ve el voto de otra');
  perform tests.assert(tests.as_user(dani, 'select sum(vote_count)::int from public.voting_results') = 1,
    'el conteo agregado si es visible para el club');
  perform tests.assert(
    tests.denied(ana, 'insert into public.voting_rounds (status) values (''open'')'),
    'solo puede haber una votacion activa a la vez');
  perform tests.assert(
    not tests.denied(dani, format('insert into public.votes (voting_round_id, proposal_id, user_id) values (%L,%L,%L)', round1, p2, dani)),
    'una integrante puede votar mientras la ronda esta abierta');
  perform tests.assert(
    tests.denied(dani, format('insert into public.votes (voting_round_id, proposal_id, user_id) values (%L,%L,%L)', round1, p2, cris)),
    'nadie puede votar en nombre de otra');
  perform tests.assert(
    tests.denied(ana, format('select public.close_voting_round(%L)', round1)),
    'un empate exige que administracion elija ganadora explicitamente');
  perform tests.assert(
    not tests.denied(ana, format('select public.close_voting_round(%L, %L, ''Desempate en la reunion'')', round1, p2)),
    'administracion resuelve el empate con override');

  raise notice '--- invitaciones y clave de invitadas ---';
  perform tests.assert(tests.as_user(cris, 'select count(*) from public.member_invitations') = 0,
    'una integrante no lee tokens de invitacion');
  perform tests.assert(
    tests.denied(cris, 'insert into public.guest_access (code_hash) values (''x'')'),
    'una integrante no puede crear la clave de invitadas');
end $$;

-- ---------------------------------------------------------------------------
-- propietaria del club y caducidad de invitaciones
-- ---------------------------------------------------------------------------
do $$
declare
  ana uuid  := (select v from tests.ids where k = 'ana');
  bea uuid  := (select v from tests.ids where k = 'bea');
  cris uuid := (select v from tests.ids where k = 'cris');
  esperado timestamptz;
begin
  raise notice '--- propietaria ---';
  -- Ana queda como propietaria; Bea vuelve a ser administradora.
  perform set_config('discucharlas.privilege_change', 'on', true);
  update public.profiles set is_owner = true where id = ana;
  update public.profiles set role = 'admin' where id = bea;
  perform set_config('discucharlas.privilege_change', 'off', true);

  perform tests.assert(
    tests.denied(bea, format('select public.set_member_role(%L, ''member'')', ana)),
    'otra administradora no puede quitarle el rol a la propietaria');
  perform tests.assert(
    tests.denied(bea, format('select public.set_member_status(%L, ''suspended'')', ana)),
    'la propietaria no puede ser suspendida');
  perform tests.assert(
    tests.denied(bea, format('select public.transfer_ownership(%L)', bea)),
    'solo la propietaria puede transferir la propiedad');
  perform tests.assert(
    tests.denied(cris, format('update public.profiles set is_owner = true where id = %L', cris)),
    'una integrante no puede auto-nombrarse propietaria');

  perform tests.assert(
    not tests.denied(ana, format('select public.transfer_ownership(%L)', bea)),
    'la propietaria si puede transferir la propiedad');
  perform tests.assert((select count(*) from public.profiles where is_owner) = 1,
    'el club tiene exactamente una propietaria');
  perform tests.assert((select is_owner from public.profiles where id = bea),
    'la propiedad quedo en quien la recibio');
  perform tests.assert((select role from public.profiles where id = ana) = 'admin',
    'la propietaria saliente sigue siendo administradora');

  raise notice '--- caducidad de invitaciones ---';
  -- La proxima discucharla es dentro de 7 dias: la invitacion deja de servir
  -- al empezar el dia previo.
  select ((current_date + 6)::timestamp at time zone 'America/Mexico_City') into esperado;

  perform tests.assert(
    not tests.denied(bea, 'insert into public.member_invitations (invitee_name, invitee_email, token_hash) values (''Sofia'', ''sofia@example.mx'', ''hash-1'')'),
    'administracion puede emitir una invitacion');
  perform tests.assert(
    (select expires_at from public.member_invitations where token_hash = 'hash-1') = esperado,
    'la invitacion caduca un dia antes de la proxima discucharla');

  insert into public.member_invitations (invitee_name, invitee_email, token_hash, expires_at)
  values ('Vieja', 'vieja@example.mx', 'hash-2', now() - interval '1 day');

  perform tests.assert(
    tests.as_user(bea, 'select count(*) from public.invitation_status where effective_status = ''expired''') = 1,
    'una invitacion vencida se reporta como caducada');
  perform tests.assert(
    tests.as_user(bea, 'select count(*) from public.invitation_status where effective_status = ''unused''') = 1,
    'la invitacion vigente sigue disponible');
  perform tests.assert(
    tests.as_user(cris, 'select count(*) from public.invitation_status') = 0,
    'una integrante no ve el estado de las invitaciones');
end $$;

select 'TODAS LAS PRUEBAS RLS PASARON' as resultado;
