import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { entornoPublico } from "@/lib/entorno";
import type { Database } from "./tipos";

/**
 * Cliente para componentes de servidor y server actions.
 * Actúa como la usuaria autenticada, así que RLS sigue mandando.
 */
export async function crearClienteServidor() {
  const galleta = await cookies();
  const entorno = entornoPublico();

  return createServerClient<Database>(
    entorno.NEXT_PUBLIC_SUPABASE_URL,
    entorno.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => galleta.getAll(),
        setAll: (nuevas) => {
          try {
            for (const { name, value, options } of nuevas) {
              galleta.set(name, value, options);
            }
          } catch {
            // Desde un componente de servidor no se pueden escribir cookies.
            // El middleware ya refrescó la sesión, así que aquí es inofensivo.
          }
        },
      },
    }
  );
}
