/**
 * Entra a la app con una cuenta de prueba y captura las pantallas, para poder
 * compararlas con las del prototipo (.prototipo/pantallas).
 *
 *   node scripts/capturar-app.mjs [base] [correo] [contraseña]
 */
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

// .env.local sin dependencias extra.
try {
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // Sin .env.local usamos lo que ya esté en el entorno.
}

const base = process.argv[2] ?? "http://localhost:3000";
const correo = process.argv[3] ?? "ana@discucharlas.local";
const clave = process.argv[4] ?? "discucharlas123";

const salida = resolve(".prototipo/app");
mkdirSync(salida, { recursive: true });

// Las rutas con id salen de la base, para no tener que adivinarlas.
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const [{ data: sesion }, { data: hilo }] = await Promise.all([
  db.from("sessions").select("id").eq("status", "upcoming").maybeSingle(),
  db.from("community_threads").select("id").limit(1).maybeSingle(),
]);

const RUTAS = [
  ["inicio", "/inicio"],
  ["calendario", "/calendario"],
  ["votacion", "/propuestas"],
  ["club-proposals", "/propuestas/lista"],
  ["club-history", "/propuestas/historial"],
  ["voto", "/propuestas/votar"],
  ["proponer", "/propuestas/nueva"],
  ["comunidad", "/comunidad"],
  ["nueva-conversacion", "/comunidad/nueva"],
  ["club", "/club"],
  ["solicitar-invitacion", "/club/proponer"],
  ["perfil", "/perfil"],
  ["archivo", "/nuestras-discucharlas"],
  ["guia", "/guia"],
  ["notificaciones", "/avisos"],
  ["administracion", "/admin"],
  ["accesos", "/admin/accesos"],
  ["miembros-admin", "/admin/integrantes"],
  ["crear", "/admin/discucharlas"],
  ["exportar-historial", "/admin/historial"],
  sesion && ["sesion", `/discucharla/${sesion.id}`],
  hilo && ["hilo", `/comunidad/${hilo.id}`],
].filter(Boolean);

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});

const problemas = [];
pagina.on("pageerror", (e) => problemas.push(String(e).split("\n")[0]));

await pagina.goto(`${base}/entrar`, { waitUntil: "networkidle" });
await pagina.fill('input[name="email"]', correo);
await pagina.fill('input[name="password"]', clave);
await pagina.click('button[type="submit"]');
await pagina.waitForTimeout(6000);

if (new URL(pagina.url()).pathname.startsWith("/entrar")) {
  await pagina.screenshot({ path: join(salida, "_entrar.png"), fullPage: true });
  console.log("no pude entrar. Texto de la pantalla:\n");
  console.log((await pagina.innerText("body")).slice(0, 800));
  await navegador.close();
  process.exit(1);
}
console.log(`sesión iniciada → ${pagina.url()}\n`);

for (const [nombre, ruta] of RUTAS) {
  problemas.length = 0;
  const respuesta = await pagina.goto(base + ruta, { waitUntil: "networkidle" });
  // El indicador de `next dev` es un círculo fijo abajo a la izquierda y se
  // cuela en las capturas justo encima de la barra de navegación.
  await pagina.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await pagina.waitForTimeout(400);
  await pagina.screenshot({ path: join(salida, `${nombre}.png`), fullPage: true });

  // Si el CSS del prototipo no cargó, el teléfono no existe y se nota aquí.
  const marco = await pagina.locator(".phone").count();
  const estado = respuesta?.status() ?? 0;
  const aviso = [
    estado !== 200 ? `HTTP ${estado}` : null,
    marco === 0 ? "sin .phone" : null,
    problemas.length ? problemas[0] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  console.log(`${aviso ? "!" : " "} ${nombre.padEnd(22)} ${ruta.padEnd(30)} ${aviso}`);
}

await navegador.close();
