"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";

export type Resultado = { error?: string; exito?: string };

/**
 * Toda acción revalida sesión y permiso además de RLS. La UI puede esconder
 * cosas; esto es lo que impide que alguien llame la acción a mano.
 */

const rsvp = z.object({
  sesion: z.string().uuid(),
  respuesta: z.enum(["yes", "maybe", "no"]),
});

export async function responderAsistencia(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = rsvp.safeParse({
    sesion: datos.get("sesion"),
    respuesta: datos.get("respuesta"),
  });
  if (!leido.success) return { error: "Respuesta no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("session_rsvps")
    .upsert(
      { session_id: leido.data.sesion, user_id: perfil.id, response: leido.data.respuesta },
      { onConflict: "session_id,user_id" }
    );

  if (error) return { error: "No se pudo guardar tu respuesta." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  revalidatePath("/inicio");
  return {};
}

const aporte = z.object({
  sesion: z.string().uuid(),
  categoria: z.enum(["bebida", "fruta", "botana_salada", "botana_dulce", "ensalada", "pan", "otro"]),
});

/**
 * Alterna una categoría. Quien decide si se pone o se quita es el servidor
 * leyendo el estado actual: si lo mandara el cliente, dos toques rápidos
 * podrían pelearse y dejar la selección al revés.
 */
export async function alternarAporte(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = aporte.safeParse({
    sesion: datos.get("sesion"),
    categoria: datos.get("categoria"),
  });
  if (!leido.success) return { error: "Categoría no válida." };

  const supabase = await crearClienteServidor();
  const { data: existente } = await supabase
    .from("session_bring_selections")
    .select("id")
    .eq("session_id", leido.data.sesion)
    .eq("user_id", perfil.id)
    .eq("category", leido.data.categoria)
    .maybeSingle();

  const { error } = existente
    ? await supabase.from("session_bring_selections").delete().eq("id", existente.id)
    : await supabase.from("session_bring_selections").insert({
        session_id: leido.data.sesion,
        user_id: perfil.id,
        category: leido.data.categoria,
      });

  if (error) return { error: "No se pudo guardar lo que llevas." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  return {};
}

const detalleOtro = z.object({
  sesion: z.string().uuid(),
  detalle: z.string().trim().max(120),
});

/** Guarda el "¿qué otra cosa?" de la categoría Otro. */
export async function guardarDetalleOtro(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = detalleOtro.safeParse({
    sesion: datos.get("sesion"),
    detalle: datos.get("detalle") ?? "",
  });
  if (!leido.success) return { error: "Ese detalle es demasiado largo." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("session_bring_selections").upsert(
    {
      session_id: leido.data.sesion,
      user_id: perfil.id,
      category: "otro",
      detail: leido.data.detalle || null,
    },
    { onConflict: "session_id,user_id,category" }
  );

  if (error) return { error: "No se pudo guardar el detalle." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  return { exito: "Guardado." };
}

const nota = z.object({
  sesion: z.string().uuid(),
  texto: z.string().max(20000),
});

export async function guardarNotaPrivada(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = nota.safeParse({ sesion: datos.get("sesion"), texto: datos.get("texto") ?? "" });
  if (!leido.success) return { error: "La nota es demasiado larga." };

  const supabase = await crearClienteServidor();
  // RLS solo deja tocar la fila propia: aunque manipularan user_id, no pasaría.
  const { error } = await supabase
    .from("session_private_notes")
    .upsert(
      { session_id: leido.data.sesion, user_id: perfil.id, note: leido.data.texto },
      { onConflict: "session_id,user_id" }
    );

  if (error) return { error: "No se pudo guardar tu nota." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  return { exito: "Guardada. Solo tú la ves." };
}

const calificacion = z.object({
  sesion: z.string().uuid(),
  valor: z.coerce.number().int().min(1).max(5),
});

export async function calificarEpisodio(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = calificacion.safeParse({
    sesion: datos.get("sesion"),
    valor: datos.get("valor"),
  });
  if (!leido.success) return { error: "Calificación no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("session_ratings")
    .upsert(
      { session_id: leido.data.sesion, user_id: perfil.id, rating: leido.data.valor },
      { onConflict: "session_id,user_id" }
    );

  if (error) return { error: "No se pudo guardar tu calificación." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  return {};
}

const comentario = z.object({
  sesion: z.string().uuid(),
  cuerpo: z.string().trim().min(1, "Escribe algo antes de enviar.").max(4000),
});

export async function comentar(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = comentario.safeParse({
    sesion: datos.get("sesion"),
    cuerpo: datos.get("cuerpo"),
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("session_comments").insert({
    session_id: leido.data.sesion,
    user_id: perfil.id,
    body: leido.data.cuerpo,
  });

  if (error) return { error: "No se pudo publicar tu comentario." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  return {};
}

const material = z.object({
  sesion: z.string().uuid(),
  titulo: z.string().trim().min(1, "Ponle un título.").max(160),
  url: z.string().trim().url("Ese enlace no parece válido."),
});

export async function agregarEnlace(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = material.safeParse({
    sesion: datos.get("sesion"),
    titulo: datos.get("titulo"),
    url: datos.get("url"),
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("session_materials").insert({
    session_id: leido.data.sesion,
    user_id: perfil.id,
    type: "link",
    title: leido.data.titulo,
    url_or_path: leido.data.url,
  });

  if (error) return { error: "No se pudo guardar el enlace." };
  revalidatePath(`/discucharla/${leido.data.sesion}`);
  return {};
}
