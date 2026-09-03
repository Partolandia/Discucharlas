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

const RUTA = ".env.local";

function leer() {
  if (!existsSync(RUTA)) return {};
  const valores = {};
  for (const linea of readFileSync(RUTA, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) valores[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return valores;
}

const actual = leer();
const url = process.argv[2] ?? actual.NEXT_PUBLIC_SUPABASE_URL ?? "";

const valores = {
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: actual.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: actual.SUPABASE_SERVICE_ROLE_KEY ?? "",
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
console.log(`Escrito ${RUTA}\n`);

const faltan = [
  ["NEXT_PUBLIC_SUPABASE_URL", "Project Settings → API → Project URL"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Project Settings → API → anon public"],
  ["SUPABASE_SERVICE_ROLE_KEY", "Project Settings → API → service_role (secreta)"],
].filter(([clave]) => !valores[clave]);

if (faltan.length === 0) {
  console.log("Todo listo. Sigue con:  npm run verificar");
} else {
  console.log("Ábrelo y pega estos valores desde el panel de Supabase:\n");
  for (const [clave, donde] of faltan) console.log(`  ${clave}\n      ${donde}\n`);
  console.log("Cuando los tengas:  npm run verificar");
}
