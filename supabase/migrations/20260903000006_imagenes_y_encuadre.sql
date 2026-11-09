-- ---------------------------------------------------------------------------
-- Imágenes del club y encuadre de la portada de Inicio
--
-- El prototipo v2 sube portadas de propuestas y de Discucharlas, fotos de
-- perfil, y deja ajustar el punto focal de la portada que se ve en Inicio.
-- Todo eso vive aquí.
-- ---------------------------------------------------------------------------

-- El bucket se crea con `npm run almacenamiento`, que es lo único que puede
-- hacerse con la llave de servicio. En una instalación nueva lo dejamos listo
-- también desde SQL para que las dos rutas acaben igual.
--
-- El bloque entero se salta si no hay esquema `storage`: la base local de
-- pruebas (scripts/local-db.sh) es un Postgres pelón, sin Supabase.
do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Sin esquema storage: me salto el bucket de imágenes.';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'imagenes', 'imagenes', true, 5242880,
    array['image/jpeg','image/png','image/webp','image/avif','image/gif']
  )
  on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

  -- Las imágenes son públicas de leer: el bucket sirve portadas a la app y a
  -- la vista de invitadas, que no se autentica.
  drop policy if exists imagenes_lectura on storage.objects;
  create policy imagenes_lectura on storage.objects
    for select using (bucket_id = 'imagenes');

  -- Subir: cualquier integrante activa (sube la portada de su propuesta y su
  -- propia foto). Modificar o borrar: solo lo suyo, o administración.
  drop policy if exists imagenes_subida_integrante on storage.objects;
  create policy imagenes_subida_integrante on storage.objects
    for insert to authenticated
    with check (bucket_id = 'imagenes' and public.is_active_member());

  drop policy if exists imagenes_actualiza_propia on storage.objects;
  create policy imagenes_actualiza_propia on storage.objects
    for update to authenticated
    using (bucket_id = 'imagenes' and (owner = auth.uid() or public.is_admin()))
    with check (bucket_id = 'imagenes' and (owner = auth.uid() or public.is_admin()));

  drop policy if exists imagenes_borra_propia on storage.objects;
  create policy imagenes_borra_propia on storage.objects
    for delete to authenticated
    using (bucket_id = 'imagenes' and (owner = auth.uid() or public.is_admin()));
end
$$;

-- ---------------------------------------------------------------------------
-- Encuadre de la portada en Inicio
--
-- La portada es cuadrada y el hero de Inicio es una franja: sin un punto focal,
-- la cara queda cortada. Son porcentajes, como `background-position`.
-- ---------------------------------------------------------------------------
alter table public.sessions
  add column if not exists focus_x smallint not null default 50
    check (focus_x between 0 and 100),
  add column if not exists focus_y smallint not null default 50
    check (focus_y between 0 and 100);
