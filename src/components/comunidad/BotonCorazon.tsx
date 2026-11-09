"use client";

import { useActionState } from "react";
import { alternarCorazon, type Resultado } from "@/app/(integrante)/comunidad/acciones";

/**
 * Corazón del prototipo v2: uno por cuenta y conversación, sin reacción
 * negativa. El prototipo lo dibuja con el carácter, no con un icono.
 */
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
        className={`social-heart${mio ? " on" : ""}`}
      >
        {mio ? "♥" : "♡"} {cuenta}
      </button>
    </form>
  );
}
