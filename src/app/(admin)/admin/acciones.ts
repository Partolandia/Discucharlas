"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { exigirAdministradora } from "@/lib/sesion";
import { guardarImagen } from "@/lib/imagenes";
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
  podcast: z.string().trim().max(160),
  url: z.union([z.string().trim().url("Ese enlace no parece válido."), z.literal("")]),
  fecha: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]),
  inicio: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal("")]),
  fin: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal("")]),
  lugar: z.string().trim().max(200),
  resumen: z.string().trim().max(4000),
  estado: z.enum(["draft", "upcoming", "past", "cancelled"]),
});

export async function crearDiscucharla(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = discucharla.safeParse({
    ...Object.fromEntries(
      ["episodio", "podcast", "url", "fecha", "inicio", "fin", "lugar", "resumen"]
        .map((k) => [k, datos.get(k) ?? ""])
    ),
    estado: datos.get("estado") || "draft",
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const portada = await guardarImagen(datos.get("portada"), "sesiones");
  if (portada.error) return { error: portada.error };

  const supabase = await crearClienteServidor();
  // "Próxima" se pide aparte: `activate_session` es quien garantiza que solo
  // haya una, jubilando a la anterior en la misma transacción.
  const proxima = leido.data.estado === "upcoming";
  const { data: creada, error } = await supabase
    .from("sessions")
    .insert({
      episode_title: leido.data.episodio,
      // La columna es NOT NULL; el prototipo deja el podcast opcional, así que
      // lo que viaja vacío se guarda vacío y se filtra al mostrarlo.
      podcast_name: leido.data.podcast,
      episode_url: leido.data.url || null,
      image_path: portada.url,
      date: leido.data.fecha || null,
      start_time: leido.data.inicio || null,
      end_time: leido.data.fin || null,
      place: leido.data.lugar || null,
      summary: leido.data.resumen || null,
      status: proxima ? "draft" : leido.data.estado,
      created_by: perfil.id,
    })
    .select("id")
    .single();

  if (error || !creada) return { error: comoMensaje(error, "No se pudo crear la discucharla.")! };

  if (proxima) {
    const { error: fallo } = await supabase.rpc("activate_session", { p_session_id: creada.id });
    if (fallo) {
      return {
        error: comoMensaje(fallo, "Se guardó como borrador, pero no pude activarla como próxima.")!,
      };
    }
  }

  revalidatePath("/admin/discucharlas");
  revalidatePath("/calendario");
  revalidatePath("/inicio");
  revalidatePath("/nuestras-discucharlas");
  return {
    exito: proxima
      ? "Creada y activada. El club ya la ve en Inicio."
      : "Ficha guardada. Puedes activarla cuando esté lista.",
  };
}

const encuadre = z.object({
  sesion: z.string().uuid(),
  x: z.coerce.number().int().min(0).max(100),
  y: z.coerce.number().int().min(0).max(100),
});

/** Punto focal de la portada en el hero de Inicio. */
export async function guardarEncuadre(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const leido = encuadre.safeParse({
    sesion: datos.get("sesion"),
    x: datos.get("x"),
    y: datos.get("y"),
  });
  if (!leido.success) return { error: "Encuadre no válido." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("sessions")
    .update({ focus_x: leido.data.x, focus_y: leido.data.y })
    .eq("id", leido.data.sesion);

  if (error) return { error: "No se pudo guardar el encuadre." };
  revalidatePath("/inicio");
  return { exito: "Encuadre guardado." };
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
/**
 * Deja las candidaturas de una ronda exactamente en el conjunto elegido.
 *
 * Quitar una candidatura de una votación abierta borra sus votos: `votes`
 * referencia `voting_candidates` con `on delete cascade`. Es el comportamiento
 * que el prototipo anuncia antes de confirmar.
 */
async function sincronizarCandidaturas(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  ronda: string,
  propuestas: string[],
  quienAgrega: string
) {
  const { data: actuales } = await supabase
    .from("voting_candidates")
    .select("proposal_id")
    .eq("voting_round_id", ronda);

  const antes = new Set((actuales ?? []).map((c) => c.proposal_id));
  const ahora = new Set(propuestas);
  const sobran = [...antes].filter((id) => !ahora.has(id));
  const faltan = [...ahora].filter((id) => !antes.has(id));

  if (sobran.length) {
    const { error } = await supabase
      .from("voting_candidates")
      .delete()
      .eq("voting_round_id", ronda)
      .in("proposal_id", sobran);
    if (error) return "No se pudieron retirar esos episodios de la votación.";
  }

  if (faltan.length) {
    const { error } = await supabase.from("voting_candidates").insert(
      faltan.map((id) => ({
        voting_round_id: ronda,
        proposal_id: id,
        added_by: quienAgrega,
      }))
    );
    if (error) return "No se pudieron sumar esos episodios a la votación.";
  }

  return null;
}

const constructor = z.object({
  ronda: z.union([z.string().uuid(), z.literal("")]),
  titulo: z.string().trim().max(200),
  propuestas: z.array(z.string().uuid()).min(2, "Elige al menos dos episodios."),
});

/**
 * "Abrir votación" del prototipo: en un solo paso crea la ronda si hace falta,
 * fija los episodios participantes y la abre. La regla de una sola votación
 * abierta la sigue aplicando `open_voting_round`.
 */
export async function abrirVotacion(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = constructor.safeParse({
    ronda: datos.get("ronda") ?? "",
    titulo: datos.get("titulo") ?? "",
    propuestas: datos.getAll("propuestas"),
  });
  if (!leido.success) {
    return { error: leido.error.issues[0]?.message ?? "Datos de la votación no válidos." };
  }

  const supabase = await crearClienteServidor();
  let ronda = leido.data.ronda;

  if (!ronda) {
    const { data, error } = await supabase
      .from("voting_rounds")
      .insert({ title: leido.data.titulo || null, status: "draft" })
      .select("id")
      .single();
    if (error || !data) {
      return {
        error: comoMensaje(
          error,
          "Ya hay una votación en preparación. Ábrela o descártala antes de crear otra."
        )!,
      };
    }
    ronda = data.id;
  } else {
    await supabase
      .from("voting_rounds")
      .update({ title: leido.data.titulo || null })
      .eq("id", ronda);
  }

  const problema = await sincronizarCandidaturas(supabase, ronda, leido.data.propuestas, perfil.id);
  if (problema) return { error: problema };

  const { error } = await supabase.rpc("open_voting_round", { p_round_id: ronda });
  if (error) return { error: comoMensaje(error, "No se pudo abrir la votación.")! };

  await supabase.rpc("notify_all_members", {
    p_type: "votacion_abierta",
    p_title: "Se abrió la votación",
    p_body: "Pasa a elegir el episodio de la próxima discucharla.",
    p_entity_type: "voting_round",
    p_entity_id: ronda,
  });

  revalidatePath("/admin/votacion");
  revalidatePath("/propuestas");
  return { exito: "Votación abierta. El club ya puede votar." };
}

/**
 * "Guardar cambios de la votación": cambia título y episodios de la votación
 * abierta. Los episodios que se conservan mantienen sus votos.
 */
export async function guardarVotacion(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = constructor.safeParse({
    ronda: datos.get("ronda") ?? "",
    titulo: datos.get("titulo") ?? "",
    propuestas: datos.getAll("propuestas"),
  });
  if (!leido.success || !leido.data.ronda) {
    return { error: leido.success ? "Votación no válida." : leido.error.issues[0]!.message };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("voting_rounds")
    .update({ title: leido.data.titulo || null })
    .eq("id", leido.data.ronda)
    .eq("status", "open");
  if (error) return { error: "No se pudo guardar la votación." };

  const problema = await sincronizarCandidaturas(
    supabase,
    leido.data.ronda,
    leido.data.propuestas,
    perfil.id
  );
  if (problema) return { error: problema };

  revalidatePath("/admin/votacion");
  revalidatePath("/propuestas");
  return { exito: "Votación actualizada." };
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

/**
 * "Reabrir votación" del prototipo. No hay función de negocio para esto: el
 * índice único parcial sobre `status = 'open'` es quien garantiza que siga
 * habiendo una sola abierta, así que basta con comprobarlo y actualizar.
 */
export async function reabrirRonda(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("ronda"));
  if (!id.success) return { error: "Votación no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("voting_rounds")
    .update({
      status: "open",
      closed_at: null,
      closed_by: null,
      winning_proposal_id: null,
      override_by: null,
      override_note: null,
    })
    .eq("id", id.data)
    .eq("status", "closed");

  if (error) {
    return {
      error: comoMensaje(error, "Ya hay otra votación abierta. Ciérrala antes de reabrir esta.")!,
    };
  }
  revalidatePath("/admin/votacion");
  revalidatePath("/propuestas");
  return { exito: "Votación reabierta. El club puede volver a votar." };
}

const seleccionFinal = z.object({
  ronda: z.string().uuid(),
  ganadora: z.string().uuid(),
  nota: z.string().trim().max(500),
});

/**
 * "Guardar selección final" sobre una votación ya cerrada: cambia el episodio
 * elegido sin tocar los votos, y queda registrado como decisión de
 * administración.
 */
export async function fijarGanadora(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirAdministradora();
  const leido = seleccionFinal.safeParse({
    ronda: datos.get("ronda"),
    ganadora: datos.get("ganadora"),
    nota: datos.get("nota") ?? "",
  });
  if (!leido.success) return { error: "Elige un episodio de esta votación." };

  const supabase = await crearClienteServidor();
  const { data: candidata } = await supabase
    .from("voting_candidates")
    .select("proposal_id")
    .eq("voting_round_id", leido.data.ronda)
    .eq("proposal_id", leido.data.ganadora)
    .maybeSingle();

  if (!candidata) return { error: "Ese episodio no es candidato de esta votación." };

  const { error } = await supabase
    .from("voting_rounds")
    .update({
      winning_proposal_id: leido.data.ganadora,
      override_by: perfil.id,
      override_note: leido.data.nota || null,
    })
    .eq("id", leido.data.ronda)
    .eq("status", "closed");

  if (error) return { error: "No se pudo guardar la selección final." };
  revalidatePath("/admin/votacion");
  revalidatePath("/propuestas");
  return { exito: "Selección final guardada. Los votos se conservan." };
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

/**
 * Elimina una cuenta suspendida, con todo lo suyo.
 *
 * Borrar en `auth.users` es lo único que pide la llave de servicio: no existe
 * otra forma de quitar la cuenta de autenticación. El permiso se comprueba
 * antes y a mano, y las condiciones (suspendida, no propietaria, no tú misma)
 * se leen con la sesión de quien lo pide, no con la llave.
 */
export async function eliminarIntegrante(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const yo = await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("integrante"));
  if (!id.success) return { error: "Integrante no válida." };
  if (id.data === yo.id) return { error: "No puedes eliminar tu propia cuenta." };

  const supabase = await crearClienteServidor();
  const { data: cuenta } = await supabase
    .from("profiles")
    .select("status, is_owner, first_name")
    .eq("id", id.data)
    .maybeSingle();

  if (!cuenta) return { error: "Esa cuenta ya no existe." };
  if (cuenta.is_owner) return { error: "La propietaria del club no se puede eliminar." };
  if (cuenta.status !== "suspended") {
    return { error: "Suspende la cuenta antes de eliminarla." };
  }

  const admin = crearClienteAdministrador();
  const { error } = await admin.auth.admin.deleteUser(id.data);
  if (error) return { error: "No se pudo eliminar la cuenta." };

  revalidatePath("/admin/integrantes");
  revalidatePath("/club");
  return { exito: `Cuenta de ${cuenta.first_name} eliminada.` };
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
    code_hash: hashear(normalizarClave(clave)),
    code: clave,
    label: (etiqueta.success && etiqueta.data) || null,
    created_by: perfil.id,
  });

  if (error) return { error: "No se pudo generar la clave." };
  revalidatePath("/admin/accesos");
  return { exito: "Clave nueva. La anterior dejó de servir en este momento." };
}

/** Así se escribe y se compara siempre: en mayúsculas y sin espacios. */
function normalizarClave(clave: string) {
  return clave.toUpperCase().replace(/\s+/g, "");
}

/**
 * "Editar código": administración escribe la clave a mano, sin cambiar de fila.
 * Útil cuando ya se repartió un código impreso y se quiere que la app lo acepte.
 */
export async function editarClaveDeInvitadas(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  await exigirAdministradora();
  const leido = z
    .object({
      clave: z.string().uuid(),
      codigo: z
        .string()
        .trim()
        .min(6, "El código necesita al menos 6 caracteres.")
        .max(40)
        .regex(/^[A-Za-z0-9-]+$/, "Usa solo letras, números y guiones."),
    })
    .safeParse({ clave: datos.get("clave"), codigo: datos.get("codigo") ?? "" });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const codigo = normalizarClave(leido.data.codigo);
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("guest_access")
    .update({ code: codigo, code_hash: hashear(codigo) })
    .eq("id", leido.data.clave)
    .eq("status", "active");

  if (error) return { error: "No se pudo guardar el código." };
  revalidatePath("/admin/accesos");
  return { exito: "Código actualizado. El anterior ya no sirve." };
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

/**
 * Devolver una solicitud ya revisada a pendiente. No reactiva ningún ingreso
 * que se hubiera generado: eso se gestiona por separado desde su tarjeta.
 */
export async function reabrirSolicitud(_previo: Resultado, datos: FormData): Promise<Resultado> {
  await exigirAdministradora();
  const id = z.string().uuid().safeParse(datos.get("solicitud"));
  if (!id.success) return { error: "Solicitud no válida." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("member_requests")
    .update({ status: "pending", reviewed_by: null, reviewed_at: null })
    .eq("id", id.data);

  if (error) return { error: "No se pudo reabrir la solicitud." };
  revalidatePath("/admin/accesos");
  return {};
}
