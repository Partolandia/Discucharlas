"use client";

import { createBrowserClient } from "@supabase/ssr";
import { entornoPublico } from "@/lib/entorno";
import type { Database } from "./tipos";

export function crearClienteNavegador() {
  const entorno = entornoPublico();
  return createBrowserClient<Database>(
    entorno.NEXT_PUBLIC_SUPABASE_URL,
    entorno.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
