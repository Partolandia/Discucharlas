import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Canjea el código de los enlaces de correo (recuperación, confirmación). */
export async function GET(peticion: NextRequest) {
  const url = new URL(peticion.url);
  const codigo = url.searchParams.get("code");
  const siguiente = url.searchParams.get("siguiente") ?? "/inicio";

  if (!codigo) {
    return NextResponse.redirect(new URL("/entrar?motivo=enlace-invalido", url.origin));
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(codigo);

  if (error) {
    return NextResponse.redirect(new URL("/entrar?motivo=enlace-vencido", url.origin));
  }

  // Solo destinos internos: un `siguiente` absoluto sería un redirect abierto.
  const destino = siguiente.startsWith("/") ? siguiente : "/inicio";
  return NextResponse.redirect(new URL(destino, url.origin));
}
