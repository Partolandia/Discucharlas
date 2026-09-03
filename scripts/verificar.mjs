/**
 * Comprueba que la app puede hablar con Supabase y que la base está lista.
 *
 *   npm run verificar
 *
 * Distingue los tres fallos que se confunden entre sí: configuración
 * incompleta, proyecto inalcanzable y migraciones sin aplicar.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

try {
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("No encuentro .env.local. Corre primero:  npm run configurar");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

let problemas = 0;
const bien = (m) => console.log(`  ok   ${m}`);
const mal = (m, comoArreglar) => {
  problemas++;
  console.log(`  MAL  ${m}`);
  if (comoArreglar) console.log(`       ${comoArreglar}`);
};

console.log("\nConfiguración");
url ? bien("URL del proyecto") : mal("falta NEXT_PUBLIC_SUPABASE_URL", "npm run configurar");
anon ? bien("llave pública") : mal("falta NEXT_PUBLIC_SUPABASE_ANON_KEY", "Project Settings → API");
servicio
  ? bien("llave de servicio")
  : mal("falta SUPABASE_SERVICE_ROLE_KEY", "hace falta para invitaciones y acceso de invitadas");
process.env.GUEST_SESSION_SECRET
  ? bien("secreto de invitadas")
  : mal("falta GUEST_SESSION_SECRET", "npm run configurar lo genera solo");

if (!url || !anon) {
  console.log("\nSin esos dos no puedo seguir comprobando.");
  process.exit(1);
}

console.log("\nConexión");
const db = createClient(url, anon, { auth: { persistSession: false } });

const { error } = await db.from("profiles").select("id").limit(1);

if (!error) {
  bien("el proyecto responde");
  bien("las tablas están creadas");
} else if (/fetch failed|ENOTFOUND|network/i.test(error.message)) {
  mal("no alcanzo el proyecto", "revisa la URL y tu conexión");
} else if (error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message)) {
  bien("el proyecto responde");
  mal("las tablas no están creadas", "npx supabase link --project-ref TU_REF && npx supabase db push");
} else if (error.code === "42501" || /permission|JWT|API key/i.test(error.message)) {
  mal("la llave pública no sirve", "cópiala otra vez de Project Settings → API");
} else {
  mal(`respuesta inesperada: ${error.message}`);
}

if (servicio && problemas === 0) {
  console.log("\nContenido");
  const admin = createClient(url, servicio, { auth: { persistSession: false } });

  const { count: integrantes } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });
  const { count: guia } = await admin
    .from("guide_sections")
    .select("id", { count: "exact", head: true });

  console.log(`  ${integrantes ?? 0} integrantes, ${guia ?? 0} secciones de guía`);
  if (!integrantes) {
    console.log("       El club está vacío. Para poblarlo:");
    console.log("       SEMBRAR_EN_SERIO=si npm run sembrar");
  }
}

console.log(
  problemas === 0
    ? "\nTodo en orden. Arranca con:  npm run dev"
    : `\n${problemas} ${problemas === 1 ? "cosa" : "cosas"} por resolver.`
);
process.exit(problemas === 0 ? 0 : 1);
