"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirAdministradora } from "@/lib/sesion";
import { hashear, nuevoToken, nuevaClaveDeInvitada } from "@/lib/tokens";
import { urlDelSitio } from "@/lib/entorno";

export type Resultado = { error?: string; exito?: string; secreto?: string };

/**
 * Las reglas duras (una sola discucharla próxima, una sola votación abierta,
 * empates, última administradora) viven en funciones de la base. Aquí las
 * llamamos y traducimos su error a algo que se pueda leer.
 */
function comoMensaje(error: { message: string } | null, respaldo: string) {
  if (!error) return null;
  // Las funciones de negocio ya lanzan mensajes escritos para una persona.
  const limpio = error.message.replace(/^.*?:\s*/, "").trim();
  return limpio.length > 3 && /[a-záéíóúñ]/i.test(limpio) ? limpio : respaldo;
}

// ---------------------------------------------------------------------------
// discucharlas
// ---------------------------------------------------------------------------
const discucharla = z.object({
  episodio: z.string().trim().min(1, "Ponle el título del episodio.").max(200),
  podcast: z.string().trim().min(1, "¿De qué podcast es?").max(160),
  url: z.union([z.string().trim().url("Ese enlace no parece válido."), z.literal("")]),
  fecha: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]),
  inicio: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal("")]),
  fin: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal("")]),
  lugar: z.string().trim().max(200),
  resumen: z.string().trim().max(4000),
});

export async function crearDiscucharla(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = discucharla.safeParse(Object.fromEntries(
    ["episodio", "podcast", "url", "fecha", "inicio", "fin", "lugar", "resumen"]
      .map((k) => [k, datos.get(k) ?? ""])
  ));
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("sessions").insert({
    episode_title: leido.data.episodio,
    podcast_name: leido.data.podcast,
    episode_url: leido.data.url || null,
    date: leido.data.fecha || null,
    start_time: leido.data.inicio || null,
    end_time: leido.data.fin || null,
    place: leido.data.lugar || null,
    summary: leido.data.resumen || null,
    created_by: perfil.id,
  });

  if (error) return { error: comoMensaje(error, "No se pudo crear la discucharla.")! };
  revalidatePath("/admin/discucharlas");
  revalidatePath("/calendario");
  return { exito: "Creada como borrador. Actívala cuando esté lista." };
}

export async function activarDiscucharla(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("sesion"));
  if (!id.success) return { error: "Discucharla no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("activate_session", { p_session_id: id.data });
  if (error) return { error: comoMensaje(error, "No se pudo activar.")! };

  await supabase.rpc("notify_all_members", {
    p_type: "sesion_activada",
    p_title: "Ya hay fecha para la próxima discucharla",
    p_body: "Entra a confirmar si vienes y qué llevas.",
    p_entity_type: "session",
    p_entity_id: id.data,
  });

  revalidatePath("/admin/discucharlas");
  revalidatePath("/inicio");
  revalidatePath("/calendario");
  return { exito: "Activada. El club ya la ve en Inicio." };
}

const cambioEstadoSesion = z.object({
  sesion: z.string().uuid(),
  estado: z.enum(["draft", "past", "cancelled"]),
});

export async function cambiarEstadoDiscucharla(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const leido = cambioEstadoSesion.safeParse({
    sesion: datos.get("sesion"),
    estado: datos.get("estado"),
  });
  if (!leido.success) return { error: "Estado no válido." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("sessions")
    .update({ status: leido.data.estado })
    .eq("id", leido.data.sesion);

  if (error) return { error: comoMensaje(error, "No se pudo cambiar el estado.")! };
  revalidatePath("/admin/discucharlas");
  revalidatePath("/calendario");
  revalidatePath("/inicio");
  return {};
}

const asistencia = z.object({
  sesion: z.string().uuid(),
  integrante: z.string().uuid(),
});

/** Asistencia real: la registra administración y puede diferir del RSVP. */
export async function alternarAsistencia(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = asistencia.safeParse({
    sesion: datos.get("sesion"),
    integrante: datos.get("integrante"),
  });
  if (!leido.success) return { error: "Registro no válido." };

  const supabase = await crearClienteServidor();
  const { data: actual } = await supabase
    .from("session_attendance")
    .select("present")
    .eq("session_id", leido.data.sesion)
    .eq("user_id", leido.data.integrante)
    .maybeSingle();

  const { error } = await supabase.from("session_attendance").upsert(
    {
      session_id: leido.data.sesion,
      user_id: leido.data.integrante,
      present: !actual?.present,
      recorded_by: perfil.id,
    },
    { onConflict: "session_id,user_id" }
  );

  if (error) return { error: "No se pudo guardar la asistencia." };
  revalidatePath(`/admin/discucharlas/${leido.data.sesion}`);
  return {};
}

// ---------------------------------------------------------------------------
// votación
// ---------------------------------------------------------------------------
export async function crearRonda(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const titulo = z.string().trim().max(160).safeParse(datos.get("titulo") ?? "");
  if (!titulo.success) return { error: "Ese título es demasiado largo." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("voting_rounds")
    .insert({ title: titulo.data || null, status: "draft" });

  if (error) {
    return {
      error: comoMensaje(
        error,
        "Ya hay una votación en preparación. Ábrela o descártala antes de crear otra."
      )!,
    };
  }
  revalidatePath("/admin/votacion");
  return {};
}

const candidata = z.object({
  ronda: z.string().uuid(),
  propuesta: z.string().uuid(),
});

export async function alternarCandidata(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = candidata.safeParse({
    ronda: datos.get("ronda"),
    propuesta: datos.get("propuesta"),
  });
  if (!leido.success) return { error: "Candidatura no válida." };

  const supabase = await crearClienteServidor();
  const { data: existe } = await supabase
    .from("voting_candidates")
    .select("proposal_id")
    .eq("voting_round_id", leido.data.ronda)
    .eq("proposal_id", leido.data.propuesta)
    .maybeSingle();

  const { error } = existe
    ? await supabase
        .from("voting_candidates")
        .delete()
        .eq("voting_round_id", leido.data.ronda)
        .eq("proposal_id", leido.data.propuesta)
    : await supabase.from("voting_candidates").insert({
        voting_round_id: leido.data.ronda,
        proposal_id: leido.data.propuesta,
        added_by: perfil.id,
      });

  if (error) return { error: "No se pudo cambiar la candidatura." };
  revalidatePath("/admin/votacion");
  return {};
}

export async function abrirRonda(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("ronda"));
  if (!id.success) return { error: "Votación no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("open_voting_round", { p_round_id: id.data });
  if (error) return { error: comoMensaje(error, "No se pudo abrir la votación.")! };

  await supabase.rpc("notify_all_members", {
    p_type: "votacion_abierta",
    p_title: "Se abrió la votación",
    p_body: "Pasa a elegir el episodio de la próxima discucharla.",
    p_entity_type: "voting_round",
    p_entity_id: id.data,
  });

  revalidatePath("/admin/votacion");
  revalidatePath("/propuestas");
  return { exito: "Votación abierta. El club ya puede votar." };
}

const cierre = z.object({
  ronda: z.string().uuid(),
  ganadora: z.union([z.string().uuid(), z.literal("")]),
  nota: z.string().trim().max(500),
});

export async function cerrarRonda(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const leido = cierre.safeParse({
    ronda: datos.get("ronda"),
    ganadora: datos.get("ganadora") ?? "",
    nota: datos.get("nota") ?? "",
  });
  if (!leido.success) return { error: "Datos de cierre no válidos." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("close_voting_round", {
    p_round_id: leido.data.ronda,
    ...(leido.data.ganadora ? { p_override_proposal_id: leido.data.ganadora } : {}),
    ...(leido.data.nota ? { p_override_note: leido.data.nota } : {}),
  });

  if (error) return { error: comoMensaje(error, "No se pudo cerrar la votación.")! };

  revalidatePath("/admin/votacion");
  revalidatePath("/propuestas");
  return { exito: "Votación cerrada. Ya puedes crear la discucharla con el episodio ganador." };
}

// ---------------------------------------------------------------------------
// integrantes
// ---------------------------------------------------------------------------
const cambioRol = z.object({
  integrante: z.string().uuid(),
  rol: z.enum(["member", "admin"]),
});

export async function cambiarRol(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const leido = cambioRol.safeParse({
    integrante: datos.get("integrante"),
    rol: datos.get("rol"),
  });
  if (!leido.success) return { error: "Rol no válido." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("set_member_role", {
    target_id: leido.data.integrante,
    new_role: leido.data.rol,
  });

  if (error) return { error: comoMensaje(error, "No se pudo cambiar el rol.")! };
  revalidatePath("/admin/integrantes");
  revalidatePath("/club");
  return {};
}

const cambioEstadoCuenta = z.object({
  integrante: z.string().uuid(),
  estado: z.enum(["active", "suspended"]),
});

export async function cambiarEstadoCuenta(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const leido = cambioEstadoCuenta.safeParse({
    integrante: datos.get("integrante"),
    estado: datos.get("estado"),
  });
  if (!leido.success) return { error: "Estado no válido." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("set_member_status", {
    target_id: leido.data.integrante,
    new_status: leido.data.estado,
  });

  if (error) return { error: comoMensaje(error, "No se pudo cambiar el estado.")! };
  revalidatePath("/admin/integrantes");
  revalidatePath("/club");
  return {};
}

export async function transferirPropiedad(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("integrante"));
  if (!id.success) return { error: "Integrante no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("transfer_ownership", { target_id: id.data });
  if (error) return { error: comoMensaje(error, "No se pudo transferir la propiedad.")! };

  revalidatePath("/admin/integrantes");
  return { exito: "Propiedad transferida. Sigues siendo administradora." };
}

// ---------------------------------------------------------------------------
// accesos
// ---------------------------------------------------------------------------
const invitacion = z.object({
  nombre: z.string().trim().min(1, "¿Cómo se llama?").max(120),
  email: z.string().trim().email("Ese correo no parece válido."),
  solicitud: z.union([z.string().uuid(), z.literal("")]),
});

/**
 * Emite una invitación. El enlace se muestra una sola vez: en la base solo
 * queda el hash, así que si se pierde hay que emitir otra.
 */
export async function emitirInvitacion(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = invitacion.safeParse({
    nombre: datos.get("nombre"),
    email: datos.get("email"),
    solicitud: datos.get("solicitud") ?? "",
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const token = nuevoToken();
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("member_invitations").insert({
    invitee_name: leido.data.nombre,
    invitee_email: leido.data.email,
    token_hash: hashear(token),
    request_id: leido.data.solicitud || null,
    created_by: perfil.id,
  });

  if (error) return { error: "No se pudo emitir la invitación." };

  if (leido.data.solicitud) {
    await supabase
      .from("member_requests")
      .update({ status: "approved", reviewed_by: perfil.id, reviewed_at: new Date().toISOString() })
      .eq("id", leido.data.solicitud);
  }

  revalidatePath("/admin/accesos");
  return {
    exito: "Invitación creada. Cópiala ahora: no se vuelve a mostrar.",
    secreto: `${urlDelSitio()}/invitacion/${token}`,
  };
}

export async function revocarInvitacion(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("invitacion"));
  if (!id.success) return { error: "Invitación no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("member_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id.data)
    .eq("status", "unused");

  if (error) return { error: "No se pudo revocar." };
  revalidatePath("/admin/accesos");
  return {};
}

/**
 * Genera la clave de invitadas. Solo puede haber una activa, así que revoca la
 * anterior primero: desde ese momento la vieja deja de servir.
 */
export async function generarClaveDeInvitadas(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const etiqueta = z.string().trim().max(120).safeParse(datos.get("etiqueta") ?? "");

  const supabase = await crearClienteServidor();
  await supabase
    .from("guest_access")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("status", "active");

  const clave = nuevaClaveDeInvitada();
  const { error } = await supabase.from("guest_access").insert({
    code_hash: hashear(clave.toUpperCase().replace(/\s+/g, "")),
    label: (etiqueta.success && etiqueta.data) || null,
    created_by: perfil.id,
  });

  if (error) return { error: "No se pudo generar la clave." };
  revalidatePath("/admin/accesos");
  return {
    exito: "Clave nueva. La anterior dejó de servir en este momento.",
    secreto: clave,
  };
}

export async function revocarClaveDeInvitadas(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("clave"));
  if (!id.success) return { error: "Clave no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("guest_access")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id.data);

  if (error) return { error: "No se pudo revocar la clave." };
  revalidatePath("/admin/accesos");
  return { exito: "Clave revocada. Quien la tuviera ya no entra." };
}

export async function rechazarSolicitud(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("solicitud"));
  if (!id.success) return { error: "Solicitud no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("member_requests")
    .update({ status: "rejected", reviewed_by: perfil.id, reviewed_at: new Date().toISOString() })
    .eq("id", id.data);

  if (error) return { error: "No se pudo actualizar la solicitud." };
  revalidatePath("/admin/accesos");
  return {};
}
