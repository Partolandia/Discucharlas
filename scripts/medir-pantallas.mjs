/**
 * Cronómetro de pantallas: mide lo que tarda cada ruta en una navegación de
 * cliente (tocando enlaces no: se empuja con el router), distinguiendo lo que
 * tarda el servidor en responder de lo que tarda en verse.
 *
 *   node scripts/medir-pantallas.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const correo = process.env.CUENTA ?? "ana@discucharlas.local";
const clave = process.env.CLAVE ?? "discucharlas123";

const RUTAS = [
  "/inicio",
  "/calendario",
  "/propuestas",
  "/propuestas/lista",
  "/propuestas/historial",
  "/comunidad",
  "/club",
  "/nuestras-discucharlas",
  "/guia",
  "/avisos",
  "/perfil",
  "/admin",
  "/admin/accesos",
  "/admin/integrantes",
  "/admin/discucharlas",
];

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
await pagina.addStyleTag({ content: "nextjs-portal{display:none!important}" });

for (const vuelta of [1, 2]) {
  console.log(`\n--- vuelta ${vuelta} ---`);
  for (const ruta of RUTAS) {
    const inicio = Date.now();
    await pagina.evaluate((r) => window.next.router.push(r), ruta);
    await pagina.waitForFunction((r) => location.pathname === r, ruta, { timeout: 60000 });
    const reaccion = Date.now() - inicio;
    await pagina.waitForLoadState("networkidle");
    const completo = Date.now() - inicio;
    console.log(
      `  ${ruta.padEnd(24)} reacciona ${String(reaccion).padStart(5)} ms · completo ${String(completo).padStart(5)} ms`
    );
  }
}

await navegador.close();
