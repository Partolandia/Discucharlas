import "server-only";

import { crearClienteServidor } from "@/lib/supabase/servidor";

const BUCKET = "imagenes";
const LIMITE = 5 * 1024 * 1024;
const TIPOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export type Subida = { url?: string | null; error?: string };

/**
 * Guarda una imagen en el bucket público y devuelve su URL.
 *
 * El bucket es público de leer porque la vista de invitadas no se autentica y
 * necesita ver las portadas. Escribir sigue pasando por RLS: la subida va con
 * la sesión de quien la hace, no con la llave de servicio.
 *
 * Devuelve `{ url: null }` cuando no venía archivo, para distinguir "no tocar"
 * de "hubo un problema".
 */
export async function guardarImagen(archivo: unknown, carpeta: string): Promise<Subida> {
  if (!(archivo instanceof File) || archivo.size === 0) return { url: null };

  if (archivo.size > LIMITE) {
    return { error: "La imagen pesa más de 5 MB. Prueba con una más ligera." };
  }

  const extension = TIPOS[archivo.type];
  if (!extension) return { error: "Usa una imagen JPG, PNG, WEBP, AVIF o GIF." };

  const supabase = await crearClienteServidor();
  const ruta = `${carpeta}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(ruta, archivo, {
    contentType: archivo.type,
    cacheControl: "31536000",
  });
  if (error) return { error: "No se pudo subir la imagen. Inténtalo otra vez." };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  return { url: data.publicUrl };
}

/**
 * Borra una imagen del bucket a partir de su URL pública. Si la URL es de otro
 * lado (o ya no está) no pasa nada: es limpieza, no una operación crítica.
 */
export async function borrarImagen(url: string | null | undefined) {
  if (!url) return;
  const marca = `/storage/v1/object/public/${BUCKET}/`;
  const corte = url.indexOf(marca);
  if (corte < 0) return;

  const supabase = await crearClienteServidor();
  await supabase.storage.from(BUCKET).remove([url.slice(corte + marca.length)]);
}
