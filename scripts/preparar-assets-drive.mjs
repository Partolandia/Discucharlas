/**
 * Organiza las 32 imágenes V135 para subir a Google Drive y copia colajes
 * a public/colaje cuando aplica.
 *
 *   npm run assets-drive -- C:\ruta\carpeta\con\discucharlas_01.jpg
 *
 * Genera:
 *   ../Discucharlas_Drive_32/   (carpetas por pantalla + raíz con los 32 archivos)
 *
 * Destino Drive (manual): https://drive.google.com/drive/folders/19bgPa4wN_kXs9ei1LXKpiAe1sFX--0Iq
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mapa = JSON.parse(readFileSync(join(__dirname, "mapa-imagenes-v135.json"), "utf8"));
const DRIVE_FOLDER_ID = "19bgPa4wN_kXs9ei1LXKpiAe1sFX--0Iq";
const SALIDA = resolve(__dirname, "..", "..", "Discucharlas_Drive_32");
const COLAJE = resolve(__dirname, "..", "public", "colaje");

const origen = process.argv[2] ? resolve(process.argv[2]) : null;

function buscarArchivo(dir, nombre, alt) {
  const candidatos = [nombre, alt, nombre.replace(/\.png$/, ".jpg"), nombre.replace(/\.jpg$/, ".png")].filter(
    Boolean
  );
  for (const c of candidatos) {
    const r = join(dir, c);
    if (existsSync(r)) return r;
  }
  return null;
}

function resumenFaltantes(dir) {
  const faltan = [];
  for (const item of mapa) {
    if (!buscarArchivo(dir, item.archivo, item.alternativoJpg)) {
      faltan.push(item.archivo + (item.alternativoJpg ? ` (o ${item.alternativoJpg})` : ""));
    }
  }
  return faltan;
}

if (!origen || !existsSync(origen)) {
  console.error("\nFalta la carpeta con las imágenes del ZIP V135.\n");
  console.error("Uso:");
  console.error("  npm run assets-drive -- C:\\ruta\\assets\n");
  console.error(`Sube el contenido de ${SALIDA} a Drive:\n`);
  console.error(`  https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}\n`);
  process.exit(1);
}

const faltan = resumenFaltantes(origen);
if (faltan.length === mapa.length) {
  console.error("\nNo encuentro discucharlas_01…32 en esa carpeta.\n");
  console.error("Deben llamarse como en la guía PDF (discucharlas_01.jpg, etc.).\n");
  process.exit(1);
}

mkdirSync(SALIDA, { recursive: true });
mkdirSync(join(SALIDA, "por-pantalla"), { recursive: true });
mkdirSync(COLAJE, { recursive: true });

const copiados = [];
const avisos = [];

for (const item of mapa) {
  const src = buscarArchivo(origen, item.archivo, item.alternativoJpg);
  if (!src) {
    avisos.push(`Falta ${item.archivo} (${item.pantalla})`);
    continue;
  }
  const nombreFinal = basename(src);
  const enRaiz = join(SALIDA, nombreFinal);
  const carpeta = join(SALIDA, "por-pantalla", item.carpetaDrive);
  mkdirSync(carpeta, { recursive: true });
  copyFileSync(src, enRaiz);
  copyFileSync(src, join(carpeta, nombreFinal));
  const leeme = join(carpeta, "UBICACION.txt");
  writeFileSync(
    leeme,
    [
      `Imagen ${item.numero}: ${nombreFinal}`,
      `Pantalla: ${item.pantalla}`,
      `Tamaño ref.: ${item.pixeles}`,
      item.colajeApp ? `App colaje: public/colaje/${item.colajeApp}.jpg` : "App: contenido dinámico (aún no colaje fijo)",
      "",
      "Guía: Discucharlas_Guia_Ubicacion_32_Imagenes.pdf",
    ].join("\n"),
    "utf8"
  );
  copiados.push(nombreFinal);

  if (item.colajeApp) {
    const ext = nombreFinal.includes(".png") ? ".png" : ".jpg";
    const destColaje = join(COLAJE, `${item.colajeApp}${ext}`);
    copyFileSync(src, destColaje);
  }
}

writeFileSync(
  join(SALIDA, "LEEME-SUBIR-A-DRIVE.txt"),
  [
    "Discucharlas — paquete 32 imágenes (V135)",
    "",
    `Sube TODO este folder a Google Drive:`,
    `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
    "",
    "- En la raíz: los 32 archivos con nombre discucharlas_XX",
    "- En por-pantalla/: mismas imágenes agrupadas por sección de la app",
    "",
    `Copiadas a public/colaje/: ${mapa.filter((m) => m.colajeApp).map((m) => m.colajeApp).join(", ")}`,
    "",
    faltan.length ? `Faltaban en origen: ${faltan.length}` : "Origen completo.",
  ].join("\n"),
  "utf8"
);

console.log(`\nListo: ${SALIDA}`);
console.log(`  ${copiados.length} archivos en raíz y por-pantalla`);
if (avisos.length) {
  console.log("\n  Aún faltan:");
  for (const a of avisos) console.log(`    - ${a}`);
}
console.log(`\nSube la carpeta a Drive:\n  https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}\n`);
