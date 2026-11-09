"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirAdministradora } from "@/lib/sesion";
import { SECCIONES_GUIA, sanearHtmlDeGuia } from "@/lib/guia";

export type Resultado = { error?: string; exito?: string };

const edicion = z.object({
  seccion: z.enum(SECCIONES_GUIA),
  titulo: z.string().trim().max(200),
  cuerpo: z.string().max(20000),
});

/**
 * Guarda una tarjeta de la guía. El cuerpo es HTML escrito en el navegador,
 * así que se filtra aquí antes de tocar la base; RLS además solo deja escribir
 * a administración.
 */
export async function guardarSeccionDeGuia(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = edicion.safeParse({
    seccion: datos.get("seccion"),
    titulo: datos.get("titulo") ?? "",
    cuerpo: datos.get("cuerpo") ?? "",
  });
  if (!leido.success) return { error: "No pude leer esa sección de la guía." };

  const cuerpo = sanearHtmlDeGuia(leido.data.cuerpo);
  if (!cuerpo) return { error: "La tarjeta no puede quedar vacía." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("guide_sections").upsert(
    {
      key: leido.data.seccion,
      title: leido.data.titulo,
      body: cuerpo,
      updated_by: perfil.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) return { error: "No se pudo guardar la guía." };
  revalidatePath("/guia");
  revalidatePath("/invitada/guia");
  return { exito: "Guía actualizada." };
}
