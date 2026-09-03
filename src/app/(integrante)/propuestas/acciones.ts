"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, exigirAdministradora } from "@/lib/sesion";

export type Resultado = { error?: string; exito?: string };

const propuesta = z.object({
  episodio: z.string().trim().min(1, "Ponle el título del episodio.").max(200),
  podcast: z.string().trim().min(1, "¿De qué podcast es?").max(160),
  url: z.union([z.string().trim().url("Ese enlace no parece válido."), z.literal("")]),
  duracion: z.string().trim().max(40),
  descripcion: z.string().trim().max(2000),
});

export async function proponerPodcast(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = propuesta.safeParse({
    episodio: datos.get("episodio"),
    podcast: datos.get("podcast"),
    url: datos.get("url") ?? "",
    duracion: datos.get("duracion") ?? "",
    descripcion: datos.get("descripcion") ?? "",
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("podcast_proposals").insert({
    proposed_by: perfil.id,
    episode_title: leido.data.episodio,
    podcast_name: leido.data.podcast,
    episode_url: leido.data.url || null,
    duration: leido.data.duracion || null,
    description: leido.data.descripcion || null,
  });

  if (error) return { error: "No se pudo guardar tu propuesta." };
  revalidatePath("/propuestas");
  revalidatePath("/inicio");
  return { exito: "Ya está en el banco de propuestas." };
}

const voto = z.object({
  ronda: z.string().uuid(),
  propuesta: z.string().uuid(),
});

/**
 * Alterna el voto. El voto es de selección múltiple: se puede apoyar más de una
 * candidatura y cambiar de opinión mientras la ronda siga abierta. Quien decide
 * si se pone o se quita es el servidor, leyendo el estado actual.
 */
export async function alternarVoto(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = voto.safeParse({
    ronda: datos.get("ronda"),
    propuesta: datos.get("propuesta"),
  });
  if (!leido.success) return { error: "Candidatura no válida." };

  const supabase = await crearClienteServidor();

  // RLS solo permite votar en una ronda abierta; esta consulta es para poder
  // explicarlo con palabras en vez de con un error genérico.
  const { data: ronda } = await supabase
    .from("voting_rounds")
    .select("status")
    .eq("id", leido.data.ronda)
    .maybeSingle();
  if (ronda?.status !== "open") {
    return { error: "Esta votación ya se cerró." };
  }

  const { data: existente } = await supabase
    .from("votes")
    .select("proposal_id")
    .eq("voting_round_id", leido.data.ronda)
    .eq("proposal_id", leido.data.propuesta)
    .eq("user_id", perfil.id)
    .maybeSingle();

  const { error } = existente
    ? await supabase
        .from("votes")
        .delete()
        .eq("voting_round_id", leido.data.ronda)
        .eq("proposal_id", leido.data.propuesta)
        .eq("user_id", perfil.id)
    : await supabase.from("votes").insert({
        voting_round_id: leido.data.ronda,
        proposal_id: leido.data.propuesta,
        user_id: perfil.id,
      });

  if (error) return { error: "No se pudo registrar tu voto." };
  revalidatePath("/propuestas/votar");
  revalidatePath("/propuestas");
  return {};
}

const cambioEstado = z.object({
  propuesta: z.string().uuid(),
  estado: z.enum(["active", "suspended"]),
});

/** Suspender o reactivar una propuesta del banco. Solo administración. */
export async function cambiarEstadoPropuesta(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const leido = cambioEstado.safeParse({
    propuesta: datos.get("propuesta"),
    estado: datos.get("estado"),
  });
  if (!leido.success) return { error: "Estado no válido." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("podcast_proposals")
    .update({ status: leido.data.estado })
    .eq("id", leido.data.propuesta);

  if (error) return { error: "No se pudo cambiar el estado." };
  revalidatePath("/propuestas");
  return {};
}
