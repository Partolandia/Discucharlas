import "server-only";

import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Vista } from "@/lib/supabase/tipos";

/**
 * En una vista Postgres no puede garantizar no-nulos, así que los tipos
 * generados marcan todo opcional. Aquí estrechamos: una fila sin id no nos
 * sirve para nada y la descartamos en la frontera.
 */
export type Integrante = Vista<"member_directory"> & { id: string };

export async function directorioDelClub(): Promise<Map<string, Integrante>> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("member_directory").select("*");

  const utiles = (data ?? []).filter((i): i is Integrante => i.id !== null);
  return new Map(utiles.map((i) => [i.id, i]));
}

export function nombreDe(directorio: Map<string, Integrante>, id: string | null) {
  const integrante = id ? directorio.get(id) : undefined;
  if (!integrante) return "Alguien del club";
  const nombre = [integrante.first_name, integrante.last_name].filter(Boolean).join(" ").trim();
  return nombre || "Alguien del club";
}
