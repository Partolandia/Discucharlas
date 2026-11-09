/**
 * Captura una ruta de la app completa (sin recortar al alto del teléfono),
 * con los `<details>` abiertos, para revisar pantallas largas.
 *
 *   node scripts/captura-larga.mjs /propuestas propuestas-admin
 */
import { chromium } from "playwright";

const [ruta, nombre] = process.argv.slice(2);

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});
const pagina = await contexto.newPage();

await pagina.goto("http://localhost:3000/entrar", { waitUntil: "networkidle" });
await pagina.fill('input[name="email"]', "ana@discucharlas.local");
await pagina.fill('input[name="password"]', process.env.SEMILLA_PASSWORD ?? "discucharlas123");
await pagina.click('button[type="submit"]');
await pagina.waitForTimeout(6000);

await pagina.goto("http://localhost:3000" + ruta, { waitUntil: "networkidle" });
await pagina.waitForTimeout(800);
await pagina.evaluate(() => {
  document.querySelectorAll("nextjs-portal").forEach((e) => e.remove());
  document.querySelectorAll("details").forEach((d) => (d.open = true));
  // El prototipo pone el scroll dentro de `.page`; para ver la pantalla
  // entera hay que devolverle el flujo normal al documento.
  const css = document.createElement("style");
  css.textContent = `
    html, body, .stage { height: auto !important; overflow: visible !important; }
    .phone { display: block !important; height: auto !important; overflow: visible !important; }
    .page.active { position: static !important; overflow: visible !important; height: auto !important; }
    .nav { position: static !important; }
  `;
  document.head.append(css);
});
await pagina.waitForTimeout(500);
await pagina.screenshot({ path: `.prototipo/${nombre}.png`, fullPage: true });
console.log(`.prototipo/${nombre}.png`);

await navegador.close();
