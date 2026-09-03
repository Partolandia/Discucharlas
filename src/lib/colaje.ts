import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

const FORMATOS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Ruta pública del collage de una sección, o null si todavía no está.
 *
 * Las imágenes del prototipo aún no están en el repo. En vez de romper el
 * encabezado con un hueco, cada pantalla cae a un degradado de su color; en
 * cuanto el archivo aparece en public/colaje, se usa sin tocar código.
 */
export function colajeDe(nombre: string): string | null {
  for (const formato of FORMATOS) {
    const relativa = `/colaje/${nombre}${formato}`;
    if (existsSync(path.join(process.cwd(), "public", relativa))) return relativa;
  }
  return null;
}
