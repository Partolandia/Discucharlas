-- Contenido inicial del club. Lo corre `supabase db reset` tras las migraciones.
-- Son secciones editables desde Administración > Guía; el texto es un punto de
-- partida para que el club lo haga suyo, no contenido definitivo.

insert into public.guide_sections (key, title, body, sort_order) values
  ('que-es', 'Qué es una discucharla',
   'Cada quince días escuchamos por nuestra cuenta un episodio de podcast y nos juntamos en casa de alguna a conversarlo. No hay que preparar nada más que haberlo escuchado y traer ganas de decir lo que te movió.',
   1),
  ('como-elegimos', 'Cómo elegimos el episodio',
   'Cualquiera puede proponer un episodio cuando quiera; las propuestas se quedan guardadas. Antes de cada sesión se abre una votación con algunas de ellas y cada quien vota por las que le laten. Las que no ganan no se borran: siguen ahí para la próxima.',
   2),
  ('como-participamos', 'Cómo participamos',
   'Cuando hay fecha, confirma si vienes y dinos qué llevas. Puedes escribir notas privadas para ti mientras escuchas: nadie más las ve, ni las administradoras. Y si quieres compartir algo con el grupo, hay comentarios y materiales en cada sesión.',
   3),
  ('invitadas', 'Invitadas',
   'Puedes traer a alguien con una clave que te damos. Las invitadas ven la próxima sesión y esta guía, pero no la comunidad, los perfiles ni la historia del club.',
   4),
  ('cuidados', 'Cómo nos cuidamos',
   'Lo que se dice en una discucharla se queda en la discucharla. Aquí solo hay reacciones positivas. Si alguien se siente incómoda con algo, escríbele a cualquiera de las administradoras.',
   5)
on conflict (key) do nothing;
