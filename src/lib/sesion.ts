import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Tabla } from "@/lib/supabase/tipos";

export type Perfil = Tabla<"profiles">;

/**
 * Perfil de quien está en sesión, o null si no hay nadie autenticado.
 *
 * Va envuelto en `cache()` porque el mismo render lo pide varias veces: el
 * cascarón para pintar el nombre y cada página para comprobar permisos. Sin
 * esto, cada llamada eran dos viajes a Supabase —validar el token y leer el
 * perfil— y se notaba en cada navegación.
 */
export const perfilActual = cache(async function perfilActual(): Promise<Perfil | null> {
  const supabase = await crearClienteServidor();

  /*
   * `getClaims()` comprueba la firma del token con la llave pública del
   * proyecto, sin preguntarle a Supabase quién es: son unos milisegundos en vez
   * de un viaje de ida y vuelta. No es leer la cookie a ciegas —eso sería
   * `getSession()`— y de todas formas la consulta que viene después pasa por
   * RLS, que es quien decide qué puede leer esta cuenta.
   */
  const { data: verificado } = await supabase.auth.getClaims();
  const id = verificado?.claims?.sub;
  if (!id) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  return data ?? null;
});

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
