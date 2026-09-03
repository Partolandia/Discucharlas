"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { hashear } from "@/lib/tokens";

export type Resultado = { error?: string };

const alta = z
  .object({
    token: z.string().min(10),
    nombre: z.string().trim().min(1, "Escribe tu nombre.").max(80),
    apellido: z.string().trim().max(80),
    telefono: z.string().trim().min(1, "El club pide un teléfono de contacto.").max(40),
    password: z.string().min(8, "Usa al menos 8 caracteres."),
    confirmacion: z.string(),
  })
  .refine((d) => d.password === d.confirmacion, {
    message: "Las dos contraseñas no coinciden.",
  });

/**
 * Canjea una invitación y crea la cuenta.
 *
 * Aquí no hay usuaria autenticada todavía, así que va con llave de servicio: el
 * permiso lo comprobamos a mano contra el hash del token. Reservamos la
 * invitación ANTES de crear la cuenta para que dos personas con el mismo enlace
 * no puedan usarlo a la vez; si la creación falla, la devolvemos.
 */
export async function aceptarInvitacion(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const leido = alta.safeParse({
    token: datos.get("token"),
    nombre: datos.get("nombre"),
    apellido: datos.get("apellido") ?? "",
    telefono: datos.get("telefono"),
    password: datos.get("password"),
    confirmacion: datos.get("confirmacion"),
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const admin = crearClienteAdministrador();
  const hash = hashear(leido.data.token);

  const { data: invitacion } = await admin
    .from("member_invitations")
    .select("*")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!invitacion || invitacion.status !== "unused") {
    return { error: "Esta invitación ya no sirve. Pídele una nueva a alguna administradora." };
  }
  if (invitacion.expires_at && new Date(invitacion.expires_at) <= new Date()) {
    return { error: "Esta invitación caducó. Pídele una nueva a alguna administradora." };
  }

  // Reserva: si otra persona se adelantó, esta actualización no toca ninguna fila.
  const { data: reservada } = await admin
    .from("member_invitations")
    .update({ status: "used", used_at: new Date().toISOString() })
    .eq("id", invitacion.id)
    .eq("status", "unused")
    .select("id")
    .maybeSingle();

  if (!reservada) {
    return { error: "Esta invitación acaba de usarse." };
  }

  const { data: creada, error: errorAlta } = await admin.auth.admin.createUser({
    email: invitacion.invitee_email,
    password: leido.data.password,
    email_confirm: true,
    user_metadata: {
      first_name: leido.data.nombre,
      last_name: leido.data.apellido,
      phone: leido.data.telefono,
    },
  });

  if (errorAlta || !creada.user) {
    // Devolvemos la invitación para que no se pierda por un fallo nuestro.
    await admin
      .from("member_invitations")
      .update({ status: "unused", used_at: null })
      .eq("id", invitacion.id);

    return {
      error: errorAlta?.message?.includes("already")
        ? "Ya existe una cuenta con ese correo. Entra con tu contraseña."
        : "No se pudo crear tu cuenta. Inténtalo otra vez.",
    };
  }

  await admin
    .from("member_invitations")
    .update({ used_by: creada.user.id })
    .eq("id", invitacion.id);

  const supabase = await crearClienteServidor();
  await supabase.auth.signInWithPassword({
    email: invitacion.invitee_email,
    password: leido.data.password,
  });

  revalidatePath("/", "layout");
  redirect("/inicio");
}
