/**
 * Deja el prototipo legible: quita los data URI (son el 99 % del peso) y separa
 * CSS y marcado en archivos que sí se pueden leer y comparar.
 *
 *   node scripts/extraer-prototipo.mjs prototipo-sesiones-v2.html
 *
 * Escribe en .prototipo/ (ignorado por git):
 *   legible.html   el documento sin base64
 *   estilos.css    todos los <style> concatenados, en orden de cascada
 *   guiones.js     todos los <script> concatenados, en orden
 *   inventario.txt qué bloques hay y en qué línea empiezan
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";

const entrada = process.argv[2] ?? "prototipo-sesiones-v2.html";
const salida = process.argv[3] ?? ".prototipo";
mkdirSync(salida, { recursive: true });

const html = readFileSync(entrada, "utf8");

// Las imágenes van embebidas en base64: las cambiamos por una marca corta que
// conserva el formato y el tamaño original para poder rastrearlas después.
let imagenes = 0;
const legible = html.replace(
  /data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)/g,
  (_todo, formato, datos) => {
    imagenes += 1;
    return `IMG:${formato}:${Math.round((datos.length * 3) / 4 / 1024)}kb:#${imagenes}`;
  },
);

const bloques = [];
const css = [];
const js = [];

const reEstilo = /<style([^>]*)>([\s\S]*?)<\/style>/g;
const reGuion = /<script([^>]*)>([\s\S]*?)<\/script>/g;

function lineaDe(indice, texto) {
  return texto.slice(0, indice).split("\n").length;
}

for (const m of legible.matchAll(reEstilo)) {
  const id = /id="([^"]+)"/.exec(m[1])?.[1] ?? "(sin id)";
  const linea = lineaDe(m.index, legible);
  bloques.push({ tipo: "style", id, linea, largo: m[2].length });
  css.push(`/* ===== style#${id} · línea ${linea} ===== */\n${m[2].trim()}\n`);
}

for (const m of legible.matchAll(reGuion)) {
  const id = /id="([^"]+)"/.exec(m[1])?.[1] ?? "(sin id)";
  const linea = lineaDe(m.index, legible);
  bloques.push({ tipo: "script", id, linea, largo: m[2].length });
  js.push(`// ===== script#${id} · línea ${linea} =====\n${m[2].trim()}\n`);
}

bloques.sort((a, b) => a.linea - b.linea);

const marcado = legible
  .replace(reEstilo, (_t, attrs) => `<!-- style ${/id="([^"]+)"/.exec(attrs)?.[1] ?? ""} -->`)
  .replace(reGuion, (_t, attrs) => `<!-- script ${/id="([^"]+)"/.exec(attrs)?.[1] ?? ""} -->`);

writeFileSync(join(salida, "legible.html"), legible);
writeFileSync(join(salida, "marcado.html"), marcado);
writeFileSync(join(salida, "estilos.css"), css.join("\n"));
writeFileSync(join(salida, "guiones.js"), js.join("\n"));
writeFileSync(
  join(salida, "inventario.txt"),
  bloques
    .map((b) => `${String(b.linea).padStart(5)}  ${b.tipo.padEnd(6)} ${b.id.padEnd(38)} ${b.largo}`)
    .join("\n"),
);

const kb = (s) => `${Math.round(s / 1024)} kb`;
console.log(`${basename(entrada)} → ${salida}/`);
console.log(`  imágenes base64 sustituidas: ${imagenes}`);
console.log(`  legible.html  ${kb(legible.length)}`);
console.log(`  marcado.html  ${kb(marcado.length)}`);
console.log(`  estilos.css   ${kb(css.join("").length)}  (${bloques.filter((b) => b.tipo === "style").length} bloques)`);
console.log(`  guiones.js    ${kb(js.join("").length)}  (${bloques.filter((b) => b.tipo === "script").length} bloques)`);
