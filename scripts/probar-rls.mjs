/**
 * Comprueba el aislamiento de datos contra el proyecto real de Supabase,
 * entrando de verdad con cada cuenta en vez de suplantarlas en SQL.
 *
 * Es el hermano portable de `supabase/tests/10_rls_test.sql`: aquel necesita un
 * Postgres local con un stub de `auth`, y no corre en Windows. Éste pasa por la
 * API con la llave anónima, así que mide lo mismo que vive la app: RLS más las
 * validaciones de las funciones de negocio.
 *
 * Solo intenta escrituras que DEBEN ser rechazadas, así que no ensucia la base.
 *
 *   node scripts/probar-rls.mjs
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !servicio) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const CLAVE = process.env.SEMILLA_PASSWORD ?? "discucharlas123";
const admin = createClient(url, servicio, { auth: { persistSession: false } });

async function entrar(correo) {
  const db = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await db.auth.signInWithPassword({ email: correo, password: CLAVE });
  if (error) throw new Error(`no pude entrar como ${correo}: ${error.message}`);
  return db;
}

let fallos = 0;
function comprobar(ok, descripcion, detalle) {
  if (ok) {
    console.log(`  ok    ${descripcion}`);
  } else {
    fallos++;
    console.log(`  FALLA ${descripcion}${detalle ? ` — ${detalle}` : ""}`);
  }
}

/** Cuenta filas visibles para esa sesión; null si la consulta fue rechazada. */
async function cuantas(db, tabla, filtro = (q) => q) {
  const { count, error } = await filtro(db.from(tabla).select("*", { count: "exact", head: true }));
  return error ? null : count;
}

/** true si la escritura fue rechazada (que es lo que esperamos probar). */
async function rechazada(promesa) {
  const { error } = await promesa;
  return Boolean(error);
}

const [ana, cris, dani] = await Promise.all([
  entrar("ana@discucharlas.local"),
  entrar("cris@discucharlas.local"),
  entrar("dani@discucharlas.local"),
]);

const { data: perfiles } = await admin.from("profiles").select("id, first_name");
const id = (nombre) => perfiles.find((p) => p.first_name === nombre).id;

console.log("\n--- perfiles y directorio ---");
comprobar((await cuantas(cris, "member_directory")) === perfiles.length,
  "una integrante ve el directorio completo del club");
{
  const { data } = await cris.from("member_directory").select("*").limit(1);
  const columnas = Object.keys(data?.[0] ?? {});
  comprobar(!columnas.includes("email") && !columnas.includes("phone"),
    "el directorio no expone email ni telefono", columnas.join(","));
}
comprobar((await cuantas(cris, "profiles", (q) => q.eq("id", id("Dani")))) === 0,
  "una integrante no puede leer el perfil completo de otra");
comprobar((await cuantas(ana, "profiles", (q) => q.eq("id", id("Dani")))) === 1,
  "administracion si puede leer datos de contacto para operar el club");

console.log("\n--- notas privadas ---");
{
  // La nota se escribe y se borra con la propia cuenta, no con la de servicio.
  const { data: sesion } = await admin.from("sessions").select("id").eq("status", "upcoming").single();
  await cris.from("session_private_notes").upsert(
    { session_id: sesion.id, user_id: id("Cris"), note: "prueba de aislamiento" },
    { onConflict: "session_id,user_id" }
  );
  comprobar((await cuantas(cris, "session_private_notes")) === 1, "la dueña ve su nota privada");
  comprobar((await cuantas(dani, "session_private_notes")) === 0, "otra integrante NO ve la nota privada");
  comprobar((await cuantas(ana, "session_private_notes")) === 0, "administracion NO ve la nota privada");
  await cris.from("session_private_notes").delete().eq("session_id", sesion.id).eq("user_id", id("Cris"));
}

console.log("\n--- roles y gobernanza ---");
comprobar(await rechazada(cris.from("profiles").update({ role: "admin" }).eq("id", id("Cris"))),
  "una integrante no puede auto-promoverse a administradora");
comprobar(await rechazada(cris.rpc("set_member_role", { target_id: id("Cris"), new_role: "admin" })),
  "set_member_role rechaza a quien no es administradora");
comprobar(await rechazada(ana.rpc("set_member_status", { target_id: id("Ana"), new_status: "suspended" })),
  "no se suspende una cuenta que todavia tiene rol de administradora");

console.log("\n--- sesiones ---");
{
  const { count: todas } = await admin.from("sessions").select("*", { count: "exact", head: true });
  const { count: borradores } = await admin
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");
  comprobar((await cuantas(cris, "sessions")) === todas - borradores,
    "una integrante no ve los borradores");
  comprobar((await cuantas(ana, "sessions")) === todas, "administracion si ve los borradores");
}
comprobar(
  await rechazada(ana.from("sessions").insert({ episode_title: "Otra", podcast_name: "Y", status: "upcoming" })),
  "solo puede haber una discucharla proxima a la vez"
);
comprobar(await rechazada(cris.from("sessions").insert({ episode_title: "Mia", podcast_name: "Z" })),
  "una integrante no puede crear discucharlas");

console.log("\n--- votacion ---");
{
  const { data: ronda } = await admin.from("voting_rounds").select("id").eq("status", "open").maybeSingle();
  const { data: propuesta } = await admin.from("podcast_proposals").select("id").limit(1).single();
  const { count: mios } = await admin
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id("Cris"));

  comprobar((await cuantas(cris, "votes")) === mios, "cada integrante ve solo su propio voto");
  comprobar((await cuantas(dani, "votes")) === 0, "una integrante NO ve el voto de otra");
  {
    const { data } = await dani.from("voting_results").select("vote_count");
    const total = (data ?? []).reduce((s, r) => s + Number(r.vote_count ?? 0), 0);
    comprobar(total > 0, "el conteo agregado si es visible para el club", `total ${total}`);
  }
  comprobar(await rechazada(ana.from("voting_rounds").insert({ status: "open" })),
    "solo puede haber una votacion activa a la vez");
  comprobar(
    await rechazada(
      dani.from("votes").insert({ voting_round_id: ronda.id, proposal_id: propuesta.id, user_id: id("Cris") })
    ),
    "nadie puede votar en nombre de otra"
  );
}

console.log("\n--- invitaciones y clave de invitadas ---");
comprobar((await cuantas(cris, "member_invitations")) === 0, "una integrante no lee tokens de invitacion");
comprobar(await rechazada(cris.from("guest_access").insert({ code_hash: "x" })),
  "una integrante no puede crear la clave de invitadas");

console.log(fallos === 0 ? "\nTodo en orden.\n" : `\n${fallos} comprobacion(es) fallaron.\n`);
process.exit(fallos === 0 ? 0 : 1);
