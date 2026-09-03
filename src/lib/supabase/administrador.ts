import "server-only";

import { createClient } from "@supabase/supabase-js";
import { entornoPublico, llaveDeServicio } from "@/lib/entorno";
import type { Database } from "./tipos";

/**
 * Cliente con llave de servicio: SALTA RLS.
 *
 * Se usa solo donde no hay usuaria autenticada y el permiso se comprueba antes
 * a mano: canje de invitaciones y vista de invitadas. Nunca en el navegador.
 */
export function crearClienteAdministrador() {
  return createClient<Database>(
    entornoPublico().NEXT_PUBLIC_SUPABASE_URL,
    llaveDeServicio(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
