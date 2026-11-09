-- ---------------------------------------------------------------------------
-- La clave de invitadas se puede volver a leer
--
-- Hasta aquí solo se guardaba el hash, así que administración no podía
-- consultar la clave vigente: tenía que generar una nueva cada vez que se le
-- olvidaba. El prototipo v2 la muestra, la deja editar a mano y avisa antes de
-- cambiarla, que es como se usa de verdad (se dicta en voz alta).
--
-- Es un secreto compartido de lectura: da acceso a la próxima Discucharla y a
-- la guía, nada más. La fila solo la pueden leer administradoras
-- (`guest_access_admin_only`), y el ingreso se sigue resolviendo contra
-- `code_hash`, no contra esta columna.
-- ---------------------------------------------------------------------------
alter table public.guest_access
  add column if not exists code text;

comment on column public.guest_access.code is
  'Clave en claro para poder mostrarla en Administración. Solo la leen administradoras; el ingreso se comprueba con code_hash.';
