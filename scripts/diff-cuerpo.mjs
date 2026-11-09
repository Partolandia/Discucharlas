/**
 * Diff del marcado del prototipo, quitando <style>, <script> y las data URL.
 * Lo que queda es el HTML que de verdad describe las pantallas.
 */
import fs from "node:fs";

const limpiar = (ruta) =>
  fs
    .readFileSync(ruta, "utf8")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, "[imagen]")
    .replace(/>\s*</g, ">\n<")
    .trim();

const [a, b] = process.argv.slice(2);
fs.mkdirSync(".devpack/diff", { recursive: true });
fs.writeFileSync(".devpack/diff/cuerpo-ANTES.html", limpiar(a));
fs.writeFileSync(".devpack/diff/cuerpo-DESPUES.html", limpiar(b));
console.log("escrito .devpack/diff/cuerpo-ANTES.html y cuerpo-DESPUES.html");
