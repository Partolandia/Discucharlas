"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SECCIONES, seccionDe, type ClaveSeccion } from "@/lib/secciones";
import { IconoCampana, IconoAjustes } from "@/components/Iconos";

/**
 * Barra superior. Toma el color de la sección salvo en Inicio, que saluda
 * sobre papel: el hero de la próxima discucharla ya tiene bastante fuerza y no
 * necesita competir con un encabezado cromático.
 */
export function CabeceraApp({
  nombre,
  inicial,
  sinLeer,
  esAdmin,
  seccionForzada,
}: {
  nombre: string;
  inicial: string;
  sinLeer: number;
  esAdmin: boolean;
  seccionForzada?: ClaveSeccion;
}) {
  const ruta = usePathname();
  const clave = seccionForzada ?? seccionDe(ruta);
  const seccion = SECCIONES[clave];
  const conColor = seccion.cabeceraConColor;

  const titulo = conColor && "titulo" in seccion ? seccion.titulo : `Hola, ${nombre}`;

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: conColor ? seccion.color : "var(--color-papel)",
        color: conColor ? "#fff" : "var(--color-tinta)",
      }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-3.5">
        <Link href="/inicio" aria-label="Ir a inicio" className="shrink-0">
          <Image
            src="/icono.svg"
            alt=""
            width={34}
            height={34}
            className="rounded-full ring-2 ring-white/70"
          />
        </Link>

        <h1 className="editorial min-w-0 flex-1 truncate text-[1.25rem] leading-none">{titulo}</h1>

        <Link href="/avisos" aria-label="Avisos" className="relative shrink-0 p-1">
          <IconoCampana className="h-[21px] w-[21px]" />
          {sinLeer > 0 && (
            <span
              aria-label={`${sinLeer} sin leer`}
              className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2"
              style={{
                background: "var(--color-inicio)",
                // El anillo iguala el fondo para que el punto no se ensucie.
                ["--tw-ring-color" as string]: conColor ? seccion.color : "var(--color-papel)",
              }}
            />
          )}
        </Link>

        {/* El engrane lleva a Administración: quien no administra no tiene
            nada que configurar aquí que no esté en su perfil. */}
        {esAdmin && (
          <Link href="/admin" aria-label="Administración" className="shrink-0 p-1">
            <IconoAjustes className="h-[21px] w-[21px]" />
          </Link>
        )}

        <Link
          href="/perfil"
          aria-label="Mi perfil"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-medium"
          style={{
            background: conColor ? "rgba(255,255,255,.9)" : "var(--color-tinta)",
            color: conColor ? seccion.color : "var(--color-papel)",
          }}
        >
          {inicial}
        </Link>
      </div>
    </header>
  );
}
