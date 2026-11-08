/**
 * Vuelca TODAS las hojas de estilo del prototipo ya cargado en un navegador.
 *
 * Hace falta porque buena parte del sistema visual (todo lo que empieza por
 * `club-`, por ejemplo) no está en etiquetas <style>: lo inyectan los guiones
 * tardíos. Leyendo el DOM final se obtienen en su orden de cascada real.
 *
 * Las imágenes ya las extrajo scripts/portar-prototipo.mjs; aquí solo se
 * sustituyen los data URI por su archivo, buscándolos por hash.
 *
 *   node scripts/portar-estilos.mjs prototipo-sesiones-v2.html
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const entrada = resolve(process.argv[2] ?? "prototipo-sesiones-v2.html");
const destino = resolve("src/estilos/prototipo-v2.css");

// hash del base64 → archivo ya escrito en public/prototipo
const porHash = new Map();
{
  const html = readFileSync(entrada, "utf8");
  const archivos = readdirSync(resolve("public/prototipo"));
  const vistos = new Map();
  for (const m of html.matchAll(/data:image\/[a-z+]+;base64,([A-Za-z0-9+/=]+)/g)) {
    const hash = createHash("sha1").update(m[1]).digest("hex").slice(0, 8);
    if (!vistos.has(hash)) vistos.set(hash, archivos.find((a) => a.includes(hash)));
  }
  for (const [hash, archivo] of vistos) if (archivo) porHash.set(hash, archivo);
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 430, height: 932 } });
await pagina.addInitScript(() => {
  window.DISC_PRIVATE_IDENTITY = {
    role: "admin",
    name: "Isa",
    userId: "00000000-0000-4000-8000-000000000001",
    bridgeNonce: "captura",
  };
});
await pagina.goto(pathToFileURL(entrada).href, { waitUntil: "load" });
await pagina.waitForTimeout(3000);
// Algunas pantallas montan su CSS la primera vez que se abren.
for (const p of ["votacion", "voto", "club", "comunidad", "calendario", "sesion", "archivo", "inicio"]) {
  await pagina.evaluate((id) => window.show?.(id), p).catch(() => {});
  await pagina.waitForTimeout(150);
}

const hojas = await pagina.evaluate(() =>
  [...document.styleSheets].map((hoja, i) => {
    let reglas = [];
    try {
      reglas = [...hoja.cssRules].map((r) => r.cssText);
    } catch {
      reglas = [`/* hoja ${i} ilegible */`];
    }
    return { id: hoja.ownerNode?.id || hoja.ownerNode?.nodeName || `hoja-${i}`, reglas };
  }),
);

await navegador.close();

let css = hojas
  .map(
    ({ id, reglas }) =>
      `/* ${"=".repeat(68)}\n   ${id} · ${reglas.length} reglas\n   ${"=".repeat(68)} */\n${reglas.join("\n")}`,
  )
  .join("\n\n");

let sustituidas = 0;
css = css.replace(/data:image\/[a-z+]+;base64,([A-Za-z0-9+/=]+)/g, (todo, datos) => {
  const archivo = porHash.get(createHash("sha1").update(datos).digest("hex").slice(0, 8));
  if (!archivo) return todo;
  sustituidas += 1;
  return `/prototipo/${archivo}`;
});

const cabecera = `/*
 * Sistema visual del prototipo v2, volcado del DOM ya renderizado.
 *
 * NO EDITAR A MANO: lo regenera scripts/portar-estilos.mjs a partir de
 * prototipo-sesiones-v2.html. Incluye las hojas que el prototipo inyecta desde
 * JavaScript, que es donde vive buena parte de las pantallas nuevas.
 *
 * ${hojas.length} hojas · ${hojas.reduce((n, h) => n + h.reglas.length, 0)} reglas
 */
`;

writeFileSync(destino, cabecera + css);
console.log(`hojas            : ${hojas.length}`);
console.log(`reglas           : ${hojas.reduce((n, h) => n + h.reglas.length, 0)}`);
console.log(`imágenes en css  : ${sustituidas}`);
console.log(`escrito          : ${destino} (${Math.round((cabecera + css).length / 1024)} kb)`);
