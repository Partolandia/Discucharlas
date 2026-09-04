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
import { llaveMalColocada } from "./llaves.mjs";

try {
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("No encuentro .env.local. Corre primero:  npm run configurar");
  process.exitCode = 1;
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

function comprobar(valor, etiqueta, comoArreglar) {
  if (valor) bien(etiqueta);
  else mal(`falta ${etiqueta}`, comoArreglar);
}

console.log("\nConfiguración");
comprobar(url, "NEXT_PUBLIC_SUPABASE_URL", "npm run configurar");
comprobar(anon, "NEXT_PUBLIC_SUPABASE_ANON_KEY", "Project Settings → API → anon public");
comprobar(
  servicio,
  "SUPABASE_SERVICE_ROLE_KEY",
  "hace falta para invitaciones y acceso de invitadas"
);
comprobar(
  process.env.GUEST_SESSION_SECRET,
  "GUEST_SESSION_SECRET",
  "npm run configurar lo genera solo"
);

// Una llave en la ranura equivocada no es un descuido menor: la pública viaja
// al navegador.
for (const [llave, ranura, nombre] of [
  [anon, "publica", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  [servicio, "servicio", "SUPABASE_SERVICE_ROLE_KEY"],
]) {
  const aviso = llaveMalColocada(llave, ranura);
  if (aviso) mal(`${nombre} está mal puesta`, aviso);
}

if (!url || !anon) {
  console.log("\nSin esos dos no puedo seguir comprobando.");
  process.exitCode = 1;
}

if (url && anon) {
console.log("\nConexión");

/**
 * Preguntamos por HTTP directo antes que con la librería: así vemos el código
 * y el cuerpo tal cual los manda Supabase. Clasificar sin enseñar el original
 * fue justo lo que nos hizo perder tiempo.
 */
let estado = 0;
let cuerpo = "";
try {
  const respuesta = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  estado = respuesta.status;
  cuerpo = (await respuesta.text()).slice(0, 400);
} catch (fallo) {
  mal("no alcanzo el proyecto", `${fallo.message} — revisa la URL y tu conexión`);
}

if (estado) {
  if (estado === 200) {
    bien("el proyecto responde");
    bien("las tablas están creadas");
  } else if (estado === 401) {
    mal(
      "la llave pública fue rechazada",
      "cópiala otra vez de Project Settings → API. Si tu proyecto usa el formato " +
        "nuevo, es la que empieza con sb_publishable_"
    );
  } else if (estado === 403) {
    // Un 403 puede venir de Supabase o de algo en medio (un proxy, una VPN, la
    // red de una oficina). El cuerpo de abajo lo aclara.
    mal(
      "acceso denegado",
      "puede ser la llave, o algo entre tu máquina y Supabase. Mira la respuesta"
    );
  } else if (estado === 404) {
    bien("el proyecto responde y acepta la llave");
    mal(
      "las tablas no están creadas todavía",
      "npx supabase link --project-ref TU_REF  &&  npx supabase db push"
    );
  } else {
    mal(`respuesta inesperada (HTTP ${estado})`);
  }

  // El cuerpo original, siempre que algo no haya salido bien.
  if (estado !== 200 && cuerpo) {
    console.log("\n  Lo que contestó Supabase, tal cual:");
    for (const linea of cuerpo.split("\n")) console.log(`    ${linea}`);
  }
}

}

if (url && anon && servicio && problemas === 0) {
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

// Marcamos el código de salida en vez de forzar la salida: process.exit() con
// peticiones todavía abiertas hace que Node reviente en Windows.
process.exitCode = problemas === 0 ? 0 : 1;
