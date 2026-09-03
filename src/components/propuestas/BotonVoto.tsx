"use client";

import { useActionState } from "react";
import { alternarVoto, type Resultado } from "@/app/(integrante)/propuestas/acciones";
import { Aviso } from "@/components/ui/Aviso";

export function BotonVoto({
  ronda,
  propuesta,
  votada,
}: {
  ronda: string;
  propuesta: string;
  votada: boolean;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(alternarVoto, {});

  return (
    <form action={accion}>
      <input type="hidden" name="ronda" value={ronda} />
      <input type="hidden" name="propuesta" value={propuesta} />
      <button
        type="submit"
        disabled={pendiente}
        aria-pressed={votada}
        className={`w-full rounded-full px-5 py-3 text-[15px] font-medium transition disabled:opacity-60 ${
          votada ? "text-white" : "border border-[var(--color-linea)] bg-white/70"
        }`}
        style={votada ? { background: "var(--color-votacion-boton)" } : undefined}
      >
        {votada ? "La elegiste ✓" : "Votar por esta"}
      </button>
      {estado.error && (
        <div className="mt-2">
          <Aviso>{estado.error}</Aviso>
        </div>
      )}
    </form>
  );
}
