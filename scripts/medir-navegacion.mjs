/**
 * Cronómetro de navegación: entra como integrante y mide lo que tarda cada
 * pestaña en aparecer, separando lo que tarda el servidor de lo que tarda el
 * navegador en pintarlo.
 *
 *   node scripts/medir-navegacion.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const correo = process.env.CUENTA ?? "ana@discucharlas.local";
const clave = process.env.CLAVE ?? "discucharlas123";

const RUTAS = ["/inicio", "/calendario", "/propuestas", "/comunidad", "/club"];

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 430, height: 932 } });

await pagina.goto(`${base}/entrar`, { waitUntil: "networkidle" });
await pagina.fill('input[name="email"]', correo);
await pagina.fill('input[name="password"]', clave);
await Promise.all([
  pagina.waitForURL(/\/inicio/, { timeout: 60000 }),
  pagina.locator('button[type="submit"]').first().click(),
]);
await pagina.waitForLoadState("networkidle");

/** Dos vueltas: la primera calienta, la segunda es la que cuenta. */
for (const vuelta of [1, 2]) {
  console.log(`\n--- vuelta ${vuelta} ---`);
  for (const ruta of RUTAS) {
    const destino = ruta.replace("/", "");
    const inicio = Date.now();
    await pagina.locator(`.nav button[data-page]`).nth(RUTAS.indexOf(ruta)).click();

    // Lo primero que ve quien toca: la ruta cambia y aparece algo.
    await pagina.waitForFunction((r) => location.pathname.startsWith(r), ruta, { timeout: 30000 });
    const reaccion = Date.now() - inicio;

    await pagina.waitForFunction(
      () => !document.querySelector('[aria-busy="true"]'),
      undefined,
      { timeout: 30000 }
    );
    await pagina.waitForLoadState("networkidle");
    const completo = Date.now() - inicio;

    console.log(
      `  ${destino.padEnd(12)} reacciona ${String(reaccion).padStart(5)} ms · completo ${String(completo).padStart(5)} ms`
    );
  }
}

await navegador.close();
