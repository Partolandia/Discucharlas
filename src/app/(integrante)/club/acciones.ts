"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";

export type Resultado = { error?: string; exito?: string };

const propuestaIntegrante = z.object({
  nombre: z.string().trim().min(1, "¿Cómo se llama?").max(120),
  email: z.union([z.string().trim().email("Ese correo no parece válido."), z.literal("")]),
  nota: z.string().trim().max(1000),
});

/**
 * Una integrante propone a alguien; administración decide si se convierte en
 * invitación. Proponer no da acceso a nadie.
 */
export async function proponerIntegrante(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = propuestaIntegrante.safeParse({
    nombre: datos.get("nombre"),
    email: datos.get("email") ?? "",
    nota: datos.get("nota") ?? "",
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("member_requests").insert({
    proposed_by: perfil.id,
    invitee_name: leido.data.nombre,
    invitee_email: leido.data.email || null,
    note: leido.data.nota || null,
  });

  if (error) return { error: "No se pudo enviar tu propuesta." };
  revalidatePath("/club");
  return { exito: "Listo. Administración la revisa y decide si le manda invitación." };
}

const perfilEditable = z.object({
  nombre: z.string().trim().min(1, "Tu nombre no puede quedar vacío.").max(80),
  apellido: z.string().trim().max(80),
  telefono: z.string().trim().max(40),
  bio: z.string().trim().max(1000),
  intereses: z.string().trim().max(1000),
  dia: z.union([z.coerce.number().int().min(1).max(31), z.literal("")]),
  mes: z.union([z.coerce.number().int().min(1).max(12), z.literal("")]),
  avisos: z.enum(["si", "no"]),
});

export async function guardarPerfil(_previo: Resultado, datos: FormData): Promise<Resultado> {
  const perfil = await exigirIntegrante();
  const leido = perfilEditable.safeParse({
    nombre: datos.get("nombre"),
    apellido: datos.get("apellido") ?? "",
    telefono: datos.get("telefono") ?? "",
    bio: datos.get("bio") ?? "",
    intereses: datos.get("intereses") ?? "",
    dia: datos.get("dia") || "",
    mes: datos.get("mes") || "",
    avisos: datos.get("avisos") === "si" ? "si" : "no",
  });
  if (!leido.success) return { error: leido.error.issues[0].message };

  const supabase = await crearClienteServidor();
  // RLS acota la fila a la propia; rol, estado y propiedad los bloquea además
  // un trigger, así que aquí no hay forma de escalar privilegios.
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: leido.data.nombre,
      last_name: leido.data.apellido,
      phone: leido.data.telefono || null,
      bio: leido.data.bio || null,
      interests: leido.data.intereses || null,
      birthday_day: leido.data.dia === "" ? null : leido.data.dia,
      birthday_month: leido.data.mes === "" ? null : leido.data.mes,
      email_notifications: leido.data.avisos === "si",
    })
    .eq("id", perfil.id);

  if (error) return { error: "No se pudo guardar tu perfil." };
  revalidatePath("/perfil");
  revalidatePath("/club");
  return { exito: "Perfil guardado." };
}
