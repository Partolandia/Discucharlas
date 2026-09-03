"use client";

import { useActionState } from "react";
import {
  cambiarEstadoPropuesta,
  type Resultado,
} from "@/app/(integrante)/propuestas/acciones";
import { Aviso } from "@/components/ui/Aviso";

/** Gestión del banco de propuestas. Solo se pinta para administración. */
export function AccionesPropuesta({
  propuesta,
  estado,
}: {
  propuesta: string;
  estado: string;
}) {
  const [resultado, accion, pendiente] = useActionState<Resultado, FormData>(
    cambiarEstadoPropuesta,
    {}
  );
  const suspendida = estado === "suspended";

  return (
    <form action={accion} className="mt-4 border-t border-[var(--color-linea)] pt-3">
      <input type="hidden" name="propuesta" value={propuesta} />
      <input type="hidden" name="estado" value={suspendida ? "active" : "suspended"} />
      <button
        type="submit"
        disabled={pendiente}
        className="rounded-full border border-[var(--color-linea)] px-4 py-1.5 text-[13px] disabled:opacity-60"
      >
        {suspendida ? "Reactivar" : "Suspender"}
      </button>
      {resultado.error && (
        <div className="mt-2">
          <Aviso>{resultado.error}</Aviso>
        </div>
      )}
    </form>
  );
}
