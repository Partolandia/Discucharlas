/**
 * Prepara .env.local sin tener que recordar qué variables hacen falta.
 *
 *   node scripts/configurar.mjs https://TU-PROYECTO.supabase.co
 *
 * Conserva lo que ya hubiera, genera solo el secreto de invitadas y dice
 * exactamente qué falta y dónde encontrarlo.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { llaveMalColocada } from "./llaves.mjs";

const RUTA = ".env.local";

/** Lee --anon y --service de la línea de comandos. */
function bandera(nombre) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 ? process.argv[i + 1]?.trim() : undefined;
}

function leer() {
  if (!existsSync(RUTA)) return {};
  const valores = {};
  for (const linea of readFileSync(RUTA, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) valores[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return valores;
}

/**
 * Comprueba que la URL sea un proyecto de verdad.
 *
 * Existe porque un texto de ejemplo copiado tal cual —con puntos suspensivos o
 * con TU-PROYECTO dentro— se escribía sin protestar, y el fallo aparecía mucho
 * más tarde y disfrazado de otra cosa.
 */
function urlUsable(valor) {
  if (!valor) return "Falta la URL del proyecto.";
  let host;
  try {
    const u = new URL(valor);
    if (u.protocol !== "https:") return "La URL debe empezar con https://";
    host = u.hostname;
  } catch {
    return `"${valor}" no es una URL válida.`;
  }
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return `"${valor}" trae caracteres que no van en una URL. ¿Copiaste el ejemplo con "…"?`;
  }
  if (/tu-proyecto|tu_proyecto|ejemplo/i.test(host)) {
    return `"${valor}" es el texto de ejemplo. Sustitúyelo por la URL de tu proyecto.`;
  }
  if (!host.endsWith(".supabase.co") && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `"${valor}" no parece un proyecto de Supabase (se espera algo.supabase.co).`;
  }
  return null;
}

const actual = leer();
const posicional = process.argv[2]?.startsWith("http") ? process.argv[2] : undefined;
const url = posicional ?? actual.NEXT_PUBLIC_SUPABASE_URL ?? "";

const problemaConLaUrl = urlUsable(url);
if (problemaConLaUrl) {
  console.error(`\nNo escribí nada. ${problemaConLaUrl}\n`);
  console.error("La encuentras en el panel de Supabase, en Project Settings → API → Project URL.");
  console.error("Se ve así:  https://abcdefghijklm.supabase.co\n");
  process.exit(1);
}
const anon = bandera("anon") ?? actual.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const servicio = bandera("service") ?? actual.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Antes de escribir nada: que ninguna llave quede en la ranura equivocada.
for (const [llave, ranura, nombre] of [
  [anon, "publica", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  [servicio, "servicio", "SUPABASE_SERVICE_ROLE_KEY"],
]) {
  const aviso = llaveMalColocada(llave, ranura);
  if (aviso) {
    console.error(`\nNo escribí nada. ${nombre}:\n  ${aviso}\n`);
    process.exit(1);
  }
}

const valores = {
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
  SUPABASE_SERVICE_ROLE_KEY: servicio,
  RESEND_API_KEY: actual.RESEND_API_KEY ?? "",
  EMAIL_FROM: actual.EMAIL_FROM ?? "Discucharlas <hola@discucharlas.mx>",
  NEXT_PUBLIC_SITE_URL: actual.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  CLUB_TIMEZONE: actual.CLUB_TIMEZONE ?? "America/Mexico_City",
  // Este sí lo generamos: no hay que pedírselo a nadie.
  GUEST_SESSION_SECRET: actual.GUEST_SESSION_SECRET || randomBytes(32).toString("base64"),
};

const contenido = `# Generado por: npm run configurar
# La llave de servicio NUNCA se comparte ni se sube al repositorio.

NEXT_PUBLIC_SUPABASE_URL=${valores.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${valores.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${valores.SUPABASE_SERVICE_ROLE_KEY}

RESEND_API_KEY=${valores.RESEND_API_KEY}
EMAIL_FROM="${valores.EMAIL_FROM}"

NEXT_PUBLIC_SITE_URL=${valores.NEXT_PUBLIC_SITE_URL}
CLUB_TIMEZONE=${valores.CLUB_TIMEZONE}
GUEST_SESSION_SECRET=${valores.GUEST_SESSION_SECRET}
`;

writeFileSync(RUTA, contenido);
console.log(`Escrito ${resolve(RUTA)}\n`);

const faltan = [
  ["NEXT_PUBLIC_SUPABASE_URL", "Project Settings → API → Project URL"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Project Settings → API → anon public"],
  ["SUPABASE_SERVICE_ROLE_KEY", "Project Settings → API → service_role (secreta)"],
].filter(([clave]) => !valores[clave]);

if (faltan.length === 0) {
  console.log("Todo listo. Sigue con:  npm run verificar");
} else {
  console.log("Faltan estos valores, en el panel de Supabase:\n");
  for (const [clave, donde] of faltan) console.log(`  ${clave}\n      ${donde}\n`);
  console.log("Puedes pasármelos aquí mismo, sin abrir el archivo:\n");
  console.log('  npm run configurar -- --anon "PEGA_LA_PUBLICA" --service "PEGA_LA_DE_SERVICIO"\n');
  console.log("O editar el archivo a mano:\n");
  console.log(`  notepad ${resolve(RUTA)}\n`);
  console.log("Cuando los tengas:  npm run verificar");
}
