/**
 * Convierte el prototipo v2 en material que la app puede usar de verdad:
 *
 *   public/prototipo/<n>.<ext>        las imágenes que venían en base64
 *   src/estilos/prototipo-v2.css      los 58 bloques <style> en orden de cascada
 *   .prototipo/imagenes.json          dónde aparecía cada imagen (alt o selector)
 *
 *   node scripts/portar-prototipo.mjs prototipo-sesiones-v2.html
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

const entrada = resolve(process.argv[2] ?? "prototipo-sesiones-v2.html");
const dirImagenes = resolve("public/prototipo");
const dirEstilos = resolve("src/estilos");
mkdirSync(dirImagenes, { recursive: true });
mkdirSync(dirEstilos, { recursive: true });
mkdirSync(resolve(".prototipo"), { recursive: true });

const html = readFileSync(entrada, "utf8");

const EXT = { jpeg: "jpg", jpg: "jpg", png: "png", webp: "webp", gif: "gif", "svg+xml": "svg" };

// ---------------------------------------------------------------------------
// imágenes
// ---------------------------------------------------------------------------
const porHash = new Map();
const apariciones = [];

const conArchivos = html.replace(
  /data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)/g,
  (todo, formato, datos) => {
    const hash = createHash("sha1").update(datos).digest("hex").slice(0, 8);
    let archivo = porHash.get(hash);

    if (!archivo) {
      const ext = EXT[formato] ?? formato;
      archivo = `${String(porHash.size + 1).padStart(2, "0")}-${hash}.${ext}`;
      porHash.set(hash, archivo);
      writeFileSync(join(dirImagenes, archivo), Buffer.from(datos, "base64"));
    }

    apariciones.push({ archivo, formato, kb: Math.round((datos.length * 3) / 4 / 1024) });
    return `/prototipo/${archivo}`;
  },
);

// Dónde se usaba cada una: el alt del <img> o la regla CSS que la envuelve.
const contexto = {};
for (const m of conArchivos.matchAll(/\/prototipo\/([\w.-]+)/g)) {
  const archivo = m[1];
  const antes = conArchivos.slice(Math.max(0, m.index - 300), m.index);
  const alt = /alt="([^"]{2,80})"/.exec(antes)?.[1];
  const id = /id="([\w-]+)"/.exec(antes)?.[1];
  const selector = /([#.][\w-]+(?:[\s>][\w#.:-]+)*)\s*\{[^{}]*$/.exec(antes)?.[1];
  (contexto[archivo] ??= []).push(alt ?? (selector ? `css ${selector}` : id ? `#${id}` : "?"));
}

// ---------------------------------------------------------------------------
// hoja de estilos
// ---------------------------------------------------------------------------
const bloques = [];
for (const m of conArchivos.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
  const id = /id="([^"]+)"/.exec(m[1])?.[1] ?? `bloque-${bloques.length + 1}`;
  bloques.push(`/* ${"=".repeat(68)}\n   ${id}\n   ${"=".repeat(68)} */\n${m[2].trim()}`);
}

const cabecera = `/*
 * Estilos del prototipo v2, tal cual, en su orden de cascada original.
 *
 * NO EDITAR A MANO: lo regenera scripts/portar-prototipo.mjs a partir de
 * prototipo-sesiones-v2.html. Si algo hay que ajustar, se ajusta encima en
 * globals.css o en el componente, no aquí.
 *
 * ${bloques.length} bloques <style> · ${porHash.size} imágenes en /public/prototipo
 */
`;

writeFileSync(join(dirEstilos, "prototipo-v2.css"), cabecera + bloques.join("\n\n"));
writeFileSync(
  resolve(".prototipo/imagenes.json"),
  JSON.stringify(
    Object.fromEntries(Object.entries(contexto).map(([k, v]) => [k, [...new Set(v)]])),
    null,
    2,
  ),
);

const kb = (n) => `${Math.round(n / 1024)} kb`;
console.log(`imágenes únicas : ${porHash.size} (de ${apariciones.length} usos)`);
console.log(`bloques de css  : ${bloques.length}`);
console.log(`css generado    : ${kb((cabecera + bloques.join("\n\n")).length)}`);
