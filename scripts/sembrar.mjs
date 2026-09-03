/**
 * Siembra un club de prueba: cuentas, una discucharla próxima, propuestas y
 * una votación abierta. Sirve para recorrer todos los estados de la app.
 *
 * CONTENIDO DE DEMOSTRACIÓN. Nombres, episodios y fechas son ilustrativos, no
 * datos reales del club. No correr contra producción.
 *
 *   node scripts/sembrar.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// .env.local sin dependencias extra.
try {
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // Sin .env.local usamos lo que ya esté en el entorno.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !llave) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
if (!/localhost|127\.0\.0\.1/.test(url) && process.env.SEMBRAR_EN_SERIO !== "si") {
  console.error("Esto es contenido de demostración y la URL no es local.");
  console.error("Si de verdad quieres sembrar ahí: SEMBRAR_EN_SERIO=si node scripts/sembrar.mjs");
  process.exit(1);
}

const db = createClient(url, llave, { auth: { persistSession: false } });
const CLAVE = process.env.SEMILLA_PASSWORD ?? "discucharlas123";

// El orden importa: la primera cuenta queda como propietaria del club.
const CUENTAS = [
  { email: "ana@discucharlas.local", first_name: "Ana", last_name: "Rivas", phone: "+52 55 1111 1111" },
  { email: "bea@discucharlas.local", first_name: "Bea", last_name: "Lomelí", phone: "+52 55 2222 2222" },
  { email: "cris@discucharlas.local", first_name: "Cris", last_name: "Mena", phone: "+52 55 3333 3333" },
  { email: "dani@discucharlas.local", first_name: "Dani", last_name: "Soto", phone: "+52 55 4444 4444" },
];

async function cuenta({ email, ...meta }) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: CLAVE,
    email_confirm: true,
    user_metadata: meta,
  });
  if (!error) return data.user.id;

  // Ya existía: la buscamos para poder re-sembrar sin limpiar todo.
  const { data: lista } = await db.auth.admin.listUsers({ perPage: 200 });
  const existente = lista?.users.find((u) => u.email === email);
  if (!existente) throw error;
  return existente.id;
}

function enDias(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const ids = [];
for (const c of CUENTAS) {
  ids.push(await cuenta(c));
  console.log(`  cuenta ${c.email}`);
}
const [ana, bea, cris, dani] = ids;

// Bea también administra, para poder probar la gestión con dos admins.
await db.rpc("set_member_role", { target_id: bea, new_role: "admin" }).then(() => {}, () => {});

const { data: pasada } = await db
  .from("sessions")
  .upsert(
    {
      human_id: "DC-0001",
      episode_title: "Lo que no se hereda",
      podcast_name: "Radio Ambulante",
      episode_url: "https://open.spotify.com/",
      date: enDias(-15),
      start_time: "18:00",
      end_time: "21:00",
      place: "Casa de Bea",
      status: "past",
      summary: "Hablamos de las cosas que sí se heredan y de las que no.",
      created_by: ana,
    },
    { onConflict: "human_id" }
  )
  .select()
  .single();

const { data: proxima } = await db
  .from("sessions")
  .upsert(
    {
      human_id: "DC-0002",
      episode_title: "El fin del amor romántico",
      podcast_name: "Casa Vieja",
      episode_url: "https://open.spotify.com/",
      date: enDias(9),
      start_time: "18:30",
      end_time: "21:30",
      place: "Casa de Ana",
      status: "upcoming",
      created_by: ana,
    },
    { onConflict: "human_id" }
  )
  .select()
  .single();

if (pasada) {
  await db.from("session_attendance").upsert(
    [ana, bea, cris].map((id) => ({ session_id: pasada.id, user_id: id, present: true, recorded_by: ana })),
    { onConflict: "session_id,user_id" }
  );
  await db.from("session_ratings").upsert(
    [
      { session_id: pasada.id, user_id: ana, rating: 5 },
      { session_id: pasada.id, user_id: bea, rating: 4 },
    ],
    { onConflict: "session_id,user_id" }
  );
}

if (proxima) {
  await db.from("session_rsvps").upsert(
    [
      { session_id: proxima.id, user_id: ana, response: "yes" },
      { session_id: proxima.id, user_id: bea, response: "yes" },
      { session_id: proxima.id, user_id: cris, response: "maybe" },
    ],
    { onConflict: "session_id,user_id" }
  );
  await db.from("session_bring_selections").upsert(
    [
      { session_id: proxima.id, user_id: ana, category: "bebida" },
      { session_id: proxima.id, user_id: bea, category: "botana_salada" },
      { session_id: proxima.id, user_id: bea, category: "pan" },
    ],
    { onConflict: "session_id,user_id,category" }
  );
}

const PROPUESTAS = [
  { proposed_by: cris, episode_title: "Las mujeres que cantaban", podcast_name: "Casa Vieja", duration: "48 min",
    description: "Tres generaciones de mujeres y lo que se dice cantando cuando no se puede decir hablando." },
  { proposed_by: dani, episode_title: "Cuando el mar suena", podcast_name: "Mar Abierto", duration: "62 min",
    description: "Un pueblo pesquero que decidió dejar de pescar." },
  { proposed_by: bea, episode_title: "La casa de mi abuela", podcast_name: "Radio Ambulante", duration: "39 min",
    description: "Qué hacemos con las casas que quedan vacías." },
  { proposed_by: ana, episode_title: "Trabajar para vivir", podcast_name: "Tiempo Libre", duration: "55 min",
    description: "Una conversación incómoda sobre el descanso." },
];

const propuestas = [];
for (const p of PROPUESTAS) {
  const { data: existe } = await db
    .from("podcast_proposals")
    .select("id")
    .eq("episode_title", p.episode_title)
    .maybeSingle();
  if (existe) {
    propuestas.push(existe.id);
    continue;
  }
  const { data } = await db.from("podcast_proposals").insert(p).select("id").single();
  if (data) propuestas.push(data.id);
}

const { data: rondaExistente } = await db
  .from("voting_rounds")
  .select("id")
  .eq("status", "open")
  .maybeSingle();

if (!rondaExistente && propuestas.length >= 2) {
  const { data: ronda } = await db
    .from("voting_rounds")
    .insert({ title: "Para la discucharla de octubre", status: "draft" })
    .select("id")
    .single();

  if (ronda) {
    await db.from("voting_candidates").insert(
      propuestas.slice(0, 3).map((proposal_id) => ({ voting_round_id: ronda.id, proposal_id, added_by: ana }))
    );
    // Abrimos con la función de negocio para respetar sus validaciones.
    await db.rpc("open_voting_round", { p_round_id: ronda.id });
    await db.from("votes").insert([
      { voting_round_id: ronda.id, proposal_id: propuestas[0], user_id: ana },
      { voting_round_id: ronda.id, proposal_id: propuestas[0], user_id: cris },
      { voting_round_id: ronda.id, proposal_id: propuestas[1], user_id: bea },
    ]);
  }
}

const { data: hayHilos } = await db.from("community_threads").select("id").limit(1);
if (!hayHilos?.length) {
  await db.from("community_threads").insert([
    { user_id: cris, title: "¿Alguien más lloró con el final?", body: "Me agarró en el metro y tuve que disimular." },
    { user_id: dani, body: "Dejo por aquí otro episodio del mismo podcast, por si quieren seguirle." },
  ]);
}

console.log("\nClub de demostración listo.");
console.log(`  Propietaria: ${CUENTAS[0].email}`);
console.log(`  Contraseña:  ${CLAVE}`);
