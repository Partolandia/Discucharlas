"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { urlDelSitio } from "@/lib/entorno";

export type EstadoFormulario = { error?: string; exito?: string };

const acceso = z.object({
  email: z.string().email("Revisa el correo: no parece una dirección válida."),
  password: z.string().min(1, "Escribe tu contraseña."),
  volver: z.string().optional(),
});

export async function entrar(
  _previo: EstadoFormulario,
  datos: FormData
): Promise<EstadoFormulario> {
  const leido = acceso.safeParse({
    email: datos.get("email"),
    password: datos.get("password"),
    volver: datos.get("volver") ?? undefined,
  });
  if (!leido.success) {
    return { error: leido.error.issues[0].message };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: leido.data.email,
    password: leido.data.password,
  });

  if (error || !data.user) {
    // Sin distinguir "no existe" de "contraseña incorrecta": decirlo revelaría
    // quién pertenece a un club privado.
    return { error: "Ese correo y esa contraseña no coinciden." };
  }

  // Una cuenta suspendida no debe quedarse con sesión abierta.
  const { data: perfil } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (perfil?.status !== "active") {
    await supabase.auth.signOut();
    return {
      error: "Tu cuenta está suspendida. Escríbele a alguna administradora del club.",
    };
  }

  revalidatePath("/", "layout");
  const destino = leido.data.volver?.startsWith("/") ? leido.data.volver : "/inicio";
  redirect(destino);
}

export async function salir() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}

export async function pedirRecuperacion(
  _previo: EstadoFormulario,
  datos: FormData
): Promise<EstadoFormulario> {
  const correo = z.string().email().safeParse(datos.get("email"));
  if (!correo.success) {
    return { error: "Revisa el correo: no parece una dirección válida." };
  }

  const supabase = await crearClienteServidor();
  await supabase.auth.resetPasswordForEmail(correo.data, {
    redirectTo: `${urlDelSitio()}/auth/callback?siguiente=/entrar/nueva-contrasena`,
  });

  // Respuesta idéntica exista o no la cuenta: no confirmamos quién es del club.
  return {
    exito:
      "Si ese correo pertenece a una integrante, le llegará un enlace para elegir contraseña nueva.",
  };
}

const nuevaContrasena = z
  .object({
    password: z.string().min(8, "Usa al menos 8 caracteres."),
    confirmacion: z.string(),
  })
  .refine((d) => d.password === d.confirmacion, {
    message: "Las dos contraseñas no coinciden.",
  });

export async function guardarNuevaContrasena(
  _previo: EstadoFormulario,
  datos: FormData
): Promise<EstadoFormulario> {
  const leido = nuevaContrasena.safeParse({
    password: datos.get("password"),
    confirmacion: datos.get("confirmacion"),
  });
  if (!leido.success) {
    return { error: leido.error.issues[0].message };
  }

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "El enlace ya no es válido. Pide uno nuevo desde «Olvidé mi contraseña»." };
  }

  const { error } = await supabase.auth.updateUser({ password: leido.data.password });
  if (error) {
    return { error: "No se pudo guardar la contraseña. Inténtalo otra vez." };
  }

  revalidatePath("/", "layout");
  redirect("/inicio");
}
