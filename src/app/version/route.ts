import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Qué versión está sirviendo este servidor. Abre /version para saberlo. */
export async function GET() {
  return NextResponse.json(
    {
      commit: process.env.VERSION_COMPILADA ?? "desconocida",
      compiladaEn: process.env.COMPILADA_EN ?? null,
      supabaseConfigurado: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      // Señal de vida: si esta ruta no existe, estás en una versión anterior
      // al 3 de septiembre.
      rutas: ["/entrar", "/inicio", "/admin", "/invitacion/[token]", "/invitada"],
    },
    { headers: { "cache-control": "no-store" } }
  );
}
