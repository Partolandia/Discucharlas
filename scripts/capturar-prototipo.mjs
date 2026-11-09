/**
 * Captura las pantallas del prototipo v2 como administradora, para poder
 * compararlas con `.prototipo/app/`.
 *
 *   node scripts/capturar-prototipo.mjs [pantalla...]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TODAS = [
  "inicio", "calendario", "votacion", "club-proposals", "club-history", "voto",
  "proponer", "comunidad", "nueva-conversacion", "club", "solicitar-invitacion",
  "perfil", "archivo", "guia", "notificaciones", "administracion", "accesos",
  "miembros-admin", "crear", "exportar-historial", "sesion", "hilo",
];

const pedidas = process.argv.slice(2);
const pantallas = pedidas.length ? pedidas : TODAS;
const destino = resolve(".prototipo/pantallas");
await mkdir(destino, { recursive: true });

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});
const pagina = await contexto.newPage();
await pagina.addInitScript(() => {
  window.DISC_PRIVATE_IDENTITY = {
    role: "admin",
    name: "Ana",
    userId: "00000000-0000-4000-8000-000000000001",
    bridgeNonce: "capturas",
  };
});
await pagina.goto(pathToFileURL(resolve("prototipo-sesiones-v2.html")).href, { waitUntil: "load" });
await pagina.waitForTimeout(4000);

for (const id of pantallas) {
  await pagina.evaluate((p) => window.show?.(p), id);
  await pagina.waitForTimeout(500);
  await pagina.screenshot({ path: resolve(destino, `${id}.png`) });
  console.log(`  ${id}`);
}

await navegador.close();
