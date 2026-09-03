import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_PUBLICAS = ["/", "/entrar", "/invitada", "/invitacion", "/offline.html"];

function esPublica(ruta: string) {
  return RUTAS_PUBLICAS.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}

/**
 * Refresca la sesión de Supabase en cada navegación y aparta a quien no ha
 * entrado. La autorización de verdad vive en RLS y en cada server action;
 * esto solo evita pantallas rotas.
 */
export async function middleware(peticion: NextRequest) {
  let respuesta = NextResponse.next({ request: peticion });
  const ruta = peticion.nextUrl.pathname;

  // La landing es pública y estática: no gasta una llamada de sesión.
  if (ruta === "/") return respuesta;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const llave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin Supabase configurado no hay sesión que refrescar. Dejamos pasar en vez
  // de tumbar el sitio entero: las páginas que sí necesitan datos fallarán solas
  // con un mensaje claro, y las públicas siguen sirviéndose.
  if (!url || !llave) return respuesta;

  const supabase = createServerClient(
    url,
    llave,
    {
      cookies: {
        getAll: () => peticion.cookies.getAll(),
        setAll: (nuevas) => {
          for (const { name, value } of nuevas) {
            peticion.cookies.set(name, value);
          }
          respuesta = NextResponse.next({ request: peticion });
          for (const { name, value, options } of nuevas) {
            respuesta.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Si Supabase no responde, la sesión queda sin resolver. No es motivo para
  // tumbar el sitio entero: las páginas públicas siguen sirviéndose y las
  // privadas mandan a entrar, que es lo mismo que haríamos sin sesión.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (fallo) {
    console.error("[discucharlas] no se pudo verificar la sesión:", fallo);
  }

  if (!user && !esPublica(ruta)) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.searchParams.set("volver", ruta);
    return NextResponse.redirect(destino);
  }

  // Quien ya entró no necesita ver la pantalla de acceso.
  if (user && ruta === "/entrar") {
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/inicio";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: [
    // Todo salvo estáticos de Next, el service worker y los iconos.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|offline.html|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)",
  ],
};
