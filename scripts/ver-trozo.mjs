/** Imprime un trozo del prototipo legible, con saltos de línea en las etiquetas.
 *  node scripts/ver-trozo.mjs <archivo> <regex-inicio> [largo]
 */
import { readFileSync } from "node:fs";

const [archivo, patron, largo = "4000"] = process.argv.slice(2);
const s = readFileSync(archivo, "utf8");
const i = s.search(new RegExp(patron));
if (i < 0) {
  console.error(`no encontré /${patron}/`);
  process.exit(1);
}
console.log(
  s
    .slice(i, i + Number(largo))
    .replace(/></g, ">\n<")
    .replace(/;(?=[a-z-]+:)/g, ";\n  "),
);
