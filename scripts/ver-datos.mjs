/**
 * Vuelca el contenido de unas tablas con la llave de servicio, para revisar el
 * estado real de la base sin pasar por la app.
 *
 *   node scripts/ver-datos.mjs sessions voting_rounds
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // Sin .env.local usamos lo que ya esté en el entorno.
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const tablas = process.argv.slice(2);
for (const tabla of tablas) {
  const { data, error } = await db.from(tabla).select("*");
  if (error) {
    console.log(`${tabla}: ERROR ${error.message}`);
    continue;
  }
  console.log(`\n=== ${tabla} (${data.length})`);
  for (const fila of data) console.log("  " + JSON.stringify(fila));
}
