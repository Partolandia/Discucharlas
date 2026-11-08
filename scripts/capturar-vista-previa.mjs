/** Captura /vista-previa/* para compararla con .prototipo/pantallas. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const salida = resolve(".prototipo/app");
mkdirSync(salida, { recursive: true });

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});
pagina.on("pageerror", (e) => console.log(`  ! ${String(e).split("\n")[0]}`));

for (const seccion of ["inicio", "calendario", "propuestas", "comunidad", "club"]) {
  await pagina.goto(`${base}/vista-previa/${seccion}`, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(600);
  await pagina.screenshot({ path: join(salida, `${seccion}.png`), fullPage: true });
  console.log(`${seccion.padEnd(12)} ${pagina.url()}`);
}

await navegador.close();
