"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { hashear, normalizarClave } from "@/lib/tokens";
import { abrirSesionDeInvitada, cerrarSesionDeInvitada } from "@/lib/invitada";

export type Resultado = { error?: string };

export async function entrarComoInvitada(
  _previo: Resultado,
  datos: FormData
): Promise<Resultado> {
  const leido = z.string().trim().min(4).max(40).safeParse(datos.get("clave"));
  if (!leido.success) return { error: "Escribe la clave que te compartieron." };

  // Sin cuenta que autenticar: comprobamos el hash contra la clave activa.
  const admin = crearClienteAdministrador();
  const { data: acceso } = await admin
    .from("guest_access")
    .select("id")
    .eq("status", "active")
    .eq("code_hash", hashear(normalizarClave(leido.data)))
    .maybeSingle();

  if (!acceso) {
    return { error: "Esa clave no es válida o ya se revocó." };
  }

  await abrirSesionDeInvitada(acceso.id);
  redirect("/invitada/inicio");
}

export async function salirComoInvitada() {
  await cerrarSesionDeInvitada();
  redirect("/");
}
