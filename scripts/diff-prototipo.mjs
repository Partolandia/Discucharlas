/**
 * Diff estructural entre dos versiones del prototipo.
 *
 * Los HTML son de varios megas y casi todo su peso son imagenes base64, asi
 * que comparar linea a linea no dice nada. Lo util es trocearlos por bloques
 * <style id> / <script id> y ver cuales aparecen, desaparecen o cambian.
 */
import fs from "node:fs";
import { createHash } from "node:crypto";

const [rutaA, rutaB] = process.argv.slice(2);
const A = fs.readFileSync(rutaA, "utf8");
const B = fs.readFileSync(rutaB, "utf8");

const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 10);

function bloques(html, etiqueta) {
  const re = new RegExp(`<${etiqueta}([^>]*)>([\\s\\S]*?)</${etiqueta}>`, "g");
  const salida = [];
  let m;
  let n = 0;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const id = /id=["']?([\w-]+)/.exec(attrs)?.[1] ?? `sin-id-${n}`;
    salida.push({ id, cuerpo: m[2], pos: m.index, orden: n });
    n += 1;
  }
  return salida;
}

function comparar(etiqueta) {
  const a = bloques(A, etiqueta);
  const b = bloques(B, etiqueta);
  const mapaA = new Map(a.map((x) => [x.id, x]));
  const mapaB = new Map(b.map((x) => [x.id, x]));

  const nuevos = b.filter((x) => !mapaA.has(x.id));
  const quitados = a.filter((x) => !mapaB.has(x.id));
  const cambiados = b.filter((x) => mapaA.has(x.id) && hash(mapaA.get(x.id).cuerpo) !== hash(x.cuerpo));

  console.log(`\n######## <${etiqueta}>  actual=${a.length}  nuevo=${b.length}`);

  if (nuevos.length) {
    console.log(`\n--- NUEVOS (${nuevos.length}) ---`);
    for (const x of nuevos) console.log(`  + [${x.orden}] ${x.id}  (${x.cuerpo.length} chars)`);
  }
  if (quitados.length) {
    console.log(`\n--- QUITADOS (${quitados.length}) ---`);
    for (const x of quitados) console.log(`  - [${x.orden}] ${x.id}  (${x.cuerpo.length} chars)`);
  }
  if (cambiados.length) {
    console.log(`\n--- MODIFICADOS (${cambiados.length}) ---`);
    for (const x of cambiados) {
      const antes = mapaA.get(x.id).cuerpo.length;
      const d = x.cuerpo.length - antes;
      console.log(`  ~ ${x.id}  ${antes} -> ${x.cuerpo.length}  (${d >= 0 ? "+" : ""}${d})`);
    }
  }
  if (!nuevos.length && !quitados.length && !cambiados.length) console.log("  sin cambios");

  return { nuevos, quitados, cambiados, mapaA };
}

const estilos = comparar("style");
const scripts = comparar("script");

// Volcar el contenido de lo nuevo y lo modificado para poder leerlo aparte.
fs.mkdirSync(".devpack/diff", { recursive: true });
for (const [tipo, r] of [["style", estilos], ["script", scripts]]) {
  for (const x of r.nuevos) {
    fs.writeFileSync(`.devpack/diff/NUEVO_${tipo}_${x.id}.txt`, x.cuerpo);
  }
  for (const x of r.cambiados) {
    fs.writeFileSync(`.devpack/diff/ANTES_${tipo}_${x.id}.txt`, r.mapaA.get(x.id).cuerpo);
    fs.writeFileSync(`.devpack/diff/DESPUES_${tipo}_${x.id}.txt`, x.cuerpo);
  }
}
console.log("\nVolcado en .devpack/diff/");
