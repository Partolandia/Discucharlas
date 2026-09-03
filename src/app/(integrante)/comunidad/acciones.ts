"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";

export type Resultado = { error?: string; exito?: string };

const hilo = z.object({
  titulo: z.string().trim().min(1, "Ponle un título a la conversación.").max(160),
  cuerpo: z.string().trim().min(1, "Escribe algo para empezar.").max(4000),
});

export async function abrirConversacion(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = hilo.safeParse({ titulo: datos.get("titulo"), cuerpo: datos.get("cuerpo") });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("community_threads").insert({
    user_id: perfil.id,
    title: leido.data.titulo,
    body: leido.data.cuerpo,
  });

  if (error) return { error: "No se pudo abrir la conversación." };
  revalidatePath("/comunidad");
  revalidatePath("/inicio");
  return { exito: "Conversación abierta." };
}

const respuesta = z.object({
  hilo: z.string().uuid(),
  cuerpo: z.string().trim().min(1, "Escribe algo antes de enviar.").max(4000),
});

export async function responder(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = respuesta.safeParse({ hilo: datos.get("hilo"), cuerpo: datos.get("cuerpo") });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("community_replies").insert({
    thread_id: leido.data.hilo,
    user_id: perfil.id,
    body: leido.data.cuerpo,
  });

  if (error) return { error: "No se pudo publicar tu respuesta." };
  revalidatePath(`/comunidad/${leido.data.hilo}`);
  revalidatePath("/comunidad");
  return {};
}

const corazon = z.object({
  hilo: z.string().uuid().optional(),
  respuesta: z.string().uuid().optional(),
});

/**
 * Solo hay corazones. El club decidió que aquí no existen reacciones negativas,
 * así que esto alterna la única que hay.
 */
export async function alternarCorazon(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = corazon.safeParse({
    hilo: datos.get("hilo") ?? undefined,
    respuesta: datos.get("respuesta") ?? undefined,
  });
  if (!leido.success || (!leido.data.hilo && !leido.data.respuesta)) {
    return { error: "No se pudo registrar tu corazón." };
  }

  const supabase = await crearClienteServidor();
  // La reacción cuelga de un hilo o de una respuesta, nunca de ambos: la base
  // lo exige con un CHECK y aquí lo escribimos explícito para no perder tipos.
  const destino = leido.data.hilo
    ? { columna: "thread_id" as const, valor: leido.data.hilo }
    : { columna: "reply_id" as const, valor: leido.data.respuesta! };

  const { data: existente } = await supabase
    .from("community_reactions")
    .select("id")
    .eq(destino.columna, destino.valor)
    .eq("user_id", perfil.id)
    .maybeSingle();

  const { error } = existente
    ? await supabase.from("community_reactions").delete().eq("id", existente.id)
    : await supabase.from("community_reactions").insert(
        destino.columna === "thread_id"
          ? { thread_id: destino.valor, user_id: perfil.id, reaction_type: "heart" }
          : { reply_id: destino.valor, user_id: perfil.id, reaction_type: "heart" }
      );

  if (error) return { error: "No se pudo registrar tu corazón." };
  revalidatePath("/comunidad");
  if (leido.data.hilo) revalidatePath(`/comunidad/${leido.data.hilo}`);
  return {};
}
