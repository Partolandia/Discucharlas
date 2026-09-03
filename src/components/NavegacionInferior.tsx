"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECCIONES, ORDEN_NAV, seccionDe, type ClaveSeccion } from "@/lib/secciones";
import {
  IconoInicio,
  IconoCalendario,
  IconoPropuestas,
  IconoComunidad,
  IconoClub,
} from "@/components/Iconos";

const ICONOS = {
  inicio: IconoInicio,
  calendario: IconoCalendario,
  propuestas: IconoPropuestas,
  comunidad: IconoComunidad,
  club: IconoClub,
} as const;

export function NavegacionInferior({ seccionForzada }: { seccionForzada?: ClaveSeccion } = {}) {
  const ruta = usePathname();
  const actual = seccionForzada ?? seccionDe(ruta);
  const color = SECCIONES[actual].color;

  // La barra entera toma el tinte de la sección en la que estás. Para el texto
  // inactivo oscurecemos ese color hacia la tinta: el matiz se conserva y el
  // contraste sobre papel se sostiene, que a 11px importa.
  const inactivo = `color-mix(in oklab, ${color} 45%, var(--color-tinta))`;

  return (
    <nav
      aria-label="Secciones del club"
      className="fixed inset-x-0 bottom-0 z-30 bg-[var(--color-papel)]"
      style={{ borderTop: `2px solid ${color}`, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-end justify-between px-2">
        {ORDEN_NAV.map((clave) => {
          const seccion = SECCIONES[clave];
          const Icono = ICONOS[clave];
          const activo = clave === actual;

          return (
            <li key={clave} className="flex-1">
              <Link
                href={seccion.ruta}
                aria-current={activo ? "page" : undefined}
                className={
                  activo
                    ? // La pestaña activa se eleva por encima de la barra.
                      "-mt-5 flex flex-col items-center gap-1.5 rounded-t-[18px] px-2 pt-4 pb-3 text-white"
                    : "flex flex-col items-center gap-1.5 px-1 pt-3 pb-3"
                }
                style={activo ? { background: color } : { color: inactivo }}
              >
                <Icono className="h-[22px] w-[22px]" />
                <span className="text-[11px] leading-none font-medium">{seccion.nav}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
