import { z } from "zod";

const esquemaPublico = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Falta NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});

/**
 * Se valida al usarse, no al importarse: así `next build` no exige tener el
 * entorno completo, pero en ejecución falla claro en vez de mandar
 * "undefined" a Supabase.
 *
 * Los accesos son literales a propósito: Next solo inlinea las NEXT_PUBLIC_*
 * si las ve escritas así.
 */
export function entornoPublico() {
  return esquemaPublico.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export const ZONA_HORARIA_CLUB = process.env.CLUB_TIMEZONE ?? "America/Mexico_City";

export function urlDelSitio() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Llave de servicio. Solo servidor: nunca debe llegar al navegador. */
export function llaveDeServicio() {
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!llave) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Se necesita para invitaciones y acceso de invitadas."
    );
  }
  return llave;
}
