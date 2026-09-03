import "server-only";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Tabla } from "@/lib/supabase/tipos";

export type Perfil = Tabla<"profiles">;

/** Perfil de quien está en sesión, o null si no hay nadie autenticado. */
export async function perfilActual(): Promise<Perfil | null> {
  const supabase = await crearClienteServidor();

  // getUser() valida el token contra Supabase; getSession() solo lee la cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data ?? null;
}

/**
 * Exige una integrante activa. Una cuenta suspendida no entra: se le cierra la
 * sesión para que no quede dando vueltas con un token que ya no sirve.
 */
export async function exigirIntegrante(): Promise<Perfil> {
  const perfil = await perfilActual();
  if (!perfil) redirect("/entrar");
  if (perfil.status !== "active") redirect("/entrar?motivo=suspendida");
  return perfil;
}

/** Exige administración. La UI ya lo esconde; esto es lo que de verdad manda. */
export async function exigirAdministradora(): Promise<Perfil> {
  const perfil = await exigirIntegrante();
  if (perfil.role !== "admin") redirect("/inicio?motivo=sin-permiso");
  return perfil;
}

export function esAdministradora(perfil: Perfil | null) {
  return perfil?.role === "admin" && perfil.status === "active";
}

export function nombreCompleto(perfil: Pick<Perfil, "first_name" | "last_name">) {
  return [perfil.first_name, perfil.last_name].filter(Boolean).join(" ").trim();
}
