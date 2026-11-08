/**
 * Lista las cuentas del proyecto y, si se le pide, le fija contraseña a una
 * para poder revisar la app en local.
 *
 *   node scripts/cuenta-de-prueba.mjs                      → solo lista
 *   node scripts/cuenta-de-prueba.mjs <correo> <clave>     → fija contraseña
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z_]+)=(.*)$/.exec(linea.trim());
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
if (error) throw error;

const { data: perfiles } = await admin.from("profiles").select("id, first_name, role, status");
const porId = new Map((perfiles ?? []).map((p) => [p.id, p]));

console.log(`proyecto: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`cuentas : ${data.users.length}\n`);
for (const u of data.users) {
  const p = porId.get(u.id);
  console.log(`  ${(u.email ?? "(sin correo)").padEnd(34)} ${p?.role ?? "—"} / ${p?.status ?? "—"}  ${p?.first_name ?? ""}`);
}

const [correo, clave] = process.argv.slice(2);
if (correo && clave) {
  const usuario = data.users.find((u) => u.email === correo);
  if (!usuario) {
    console.error(`\nno existe ${correo}`);
    process.exit(1);
  }
  const { error: fallo } = await admin.auth.admin.updateUserById(usuario.id, { password: clave });
  if (fallo) throw fallo;
  console.log(`\ncontraseña actualizada para ${correo}`);
}
