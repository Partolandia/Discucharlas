"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconoInicio,
  IconoCalendario,
  IconoPropuestas,
  IconoComunidad,
  IconoClub,
} from "@/components/Iconos";

// Cinco destinos, cada uno con su color protagonista. Está fijado por el
// documento maestro y no se cambia sin una decisión de producto.
const DESTINOS = [
  { href: "/inicio", texto: "Inicio", Icono: IconoInicio, color: "var(--color-inicio)" },
  { href: "/calendario", texto: "Calendario", Icono: IconoCalendario, color: "var(--color-calendario)" },
  { href: "/propuestas", texto: "Propuestas", Icono: IconoPropuestas, color: "var(--color-propuestas)" },
  { href: "/comunidad", texto: "Comunidad", Icono: IconoComunidad, color: "var(--color-comunidad-fuerte)" },
  { href: "/club", texto: "Club", Icono: IconoClub, color: "var(--color-club)" },
] as const;

export function NavegacionInferior() {
  const ruta = usePathname();

  return (
    <nav
      aria-label="Secciones del club"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-linea)] bg-[var(--color-papel)]/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {DESTINOS.map(({ href, texto, Icono, color }) => {
          const activo = ruta === href || ruta.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                // Sobre el color protagonista, ícono y texto van en blanco para
                // conservar contraste.
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[var(--radius-suave)] px-1 py-1.5 transition ${
                  activo ? "text-white" : "text-[var(--color-tinta-suave)]"
                }`}
                style={activo ? { background: color } : undefined}
              >
                <Icono className="h-[22px] w-[22px]" />
                <span className="text-[11px] leading-none font-medium">{texto}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
