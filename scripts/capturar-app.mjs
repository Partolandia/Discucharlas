/**
 * Entra a la app con una cuenta de prueba y captura las pantallas, para poder
 * compararlas con las del prototipo (.prototipo/pantallas).
 *
 *   node scripts/capturar-app.mjs [base] [correo] [contraseña]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const correo = process.argv[3] ?? "ana@discucharlas.local";
const clave = process.argv[4] ?? "discucharlas123";

const salida = resolve(".prototipo/app");
mkdirSync(salida, { recursive: true });

const RUTAS = [
  ["inicio", "/inicio"],
  ["calendario", "/calendario"],
  ["votacion", "/propuestas"],
  ["comunidad", "/comunidad"],
  ["club", "/club"],
  ["archivo", "/nuestras-discucharlas"],
];

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});

pagina.on("pageerror", (e) => console.log(`  ! ${String(e).split("\n")[0]}`));

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
console.log(`sesión iniciada → ${pagina.url()}`);

for (const [nombre, ruta] of RUTAS) {
  await pagina.goto(base + ruta, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(500);
  await pagina.screenshot({ path: join(salida, `${nombre}.png`), fullPage: true });
  console.log(`${nombre.padEnd(14)} ${ruta}`);
}

await navegador.close();
