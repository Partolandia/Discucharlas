/**
 * Crea el bucket de imágenes del club si todavía no existe.
 *
 *   npm run almacenamiento
 *
 * Es idempotente: se puede correr las veces que haga falta. Las políticas de
 * `storage.objects` viven en supabase/migrations; aquí solo se crea el bucket,
 * que es lo único que la API de servicio permite hacer sin acceso a Postgres.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "imagenes";
const LIMITE = 5 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

const entorno = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((linea) => linea.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")])
);

const supabase = createClient(
  entorno.NEXT_PUBLIC_SUPABASE_URL,
  entorno.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: buckets, error: fallo } = await supabase.storage.listBuckets();
if (fallo) {
  console.error("No pude listar los buckets:", fallo.message);
  process.exit(1);
}

const ajustes = { public: true, fileSizeLimit: LIMITE, allowedMimeTypes: TIPOS };

if (buckets.some((b) => b.name === BUCKET)) {
  const { error } = await supabase.storage.updateBucket(BUCKET, ajustes);
  if (error) {
    console.error("No pude actualizar el bucket:", error.message);
    process.exit(1);
  }
  console.log(`El bucket "${BUCKET}" ya existía. Ajustes al día.`);
} else {
  const { error } = await supabase.storage.createBucket(BUCKET, ajustes);
  if (error) {
    console.error("No pude crear el bucket:", error.message);
    process.exit(1);
  }
  console.log(`Bucket "${BUCKET}" creado: público para leer, 5 MB por archivo.`);
}
