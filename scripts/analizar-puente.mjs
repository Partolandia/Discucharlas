/** Qué le pide el prototipo v2 a su anfitrión (puente postMessage). */
import { readFileSync } from "node:fs";

const s = readFileSync(".prototipo/guiones.js", "utf8");

const saca = (re) => [...s.matchAll(re)].map((m) => m[1]);
const uniq = (a) => [...new Set(a)].sort();

console.log("acciones de primer nivel:", uniq(saca(/request\(\s*['"]([a-z-]+)['"]/g)).join(", "));
console.log("sub-acciones club-write :", uniq(saca(/action\s*:\s*['"]([a-z_]{4,})['"]/g)).join(", "));
console.log("campos de identidad     :", uniq(saca(/\b(?:cfg|config|identity)\.([a-zA-Z]+)/g)).join(", "));
console.log("claves de fila sesión   :", uniq(saca(/\brow\.([a-z_]+)/g)).join(", "));

const llamadas = [...s.matchAll(/request\(\s*['"](club-read|club-write|list|save)['"]\s*,\s*([^\n]{0,160})/g)];
console.log(`\ncall sites (${llamadas.length}):`);
for (const m of llamadas.slice(0, 40)) console.log(`  ${m[1]}  ${m[2].replace(/\s+/g, " ").slice(0, 130)}`);
