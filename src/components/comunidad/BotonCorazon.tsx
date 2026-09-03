"use client";

import { useActionState } from "react";
import { alternarCorazon, type Resultado } from "@/app/(integrante)/comunidad/acciones";
import { IconoCorazon } from "@/components/Iconos";

export function BotonCorazon({
  hilo,
  respuesta,
  cuenta,
  mio,
}: {
  hilo?: string;
  respuesta?: string;
  cuenta: number;
  mio: boolean;
}) {
  const [, accion, pendiente] = useActionState<Resultado, FormData>(alternarCorazon, {});

  return (
    <form action={accion}>
      {hilo && <input type="hidden" name="hilo" value={hilo} />}
      {respuesta && <input type="hidden" name="respuesta" value={respuesta} />}
      <button
        type="submit"
        disabled={pendiente}
        aria-pressed={mio}
        aria-label={mio ? "Quitar corazón" : "Dar corazón"}
        className="flex items-center gap-1.5 text-[13px] text-[var(--color-tinta-suave)] disabled:opacity-60"
      >
        <IconoCorazon
          className="h-5 w-5"
          relleno={mio}
          {...(mio ? { style: { color: "var(--color-inicio)" } } : {})}
        />
        {cuenta > 0 && <span>{cuenta}</span>}
      </button>
    </form>
  );
}
