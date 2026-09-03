"use client";

import { useActionState } from "react";
import { responderAsistencia, type Resultado } from "@/app/(integrante)/discucharla/acciones";
import { RESPUESTAS_RSVP } from "@/lib/dominio";
import { Aviso } from "@/components/ui/Aviso";

export function Asistencia({
  sesion,
  miRespuesta,
  bloqueada,
}: {
  sesion: string;
  miRespuesta: string | null;
  bloqueada?: boolean;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(
    responderAsistencia,
    {}
  );

  if (bloqueada) return null;

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="sesion" value={sesion} />
      <fieldset disabled={pendiente} className="space-y-2">
        <legend className="editorial mb-3 text-[1.5rem]">¿Vienes?</legend>
        {RESPUESTAS_RSVP.map((r) => {
          const elegida = miRespuesta === r.valor;
          return (
            <button
              key={r.valor}
              type="submit"
              name="respuesta"
              value={r.valor}
              aria-pressed={elegida}
              className={`w-full rounded-[var(--radius-suave)] border px-5 py-3.5 text-left text-[16px] font-medium transition ${
                elegida
                  ? "border-transparent text-white"
                  : "border-[var(--color-linea)] bg-white/70 text-[var(--color-tinta)]"
              }`}
              style={elegida ? { background: r.color } : undefined}
            >
              {r.texto}
            </button>
          );
        })}
      </fieldset>
      {estado.error && <Aviso>{estado.error}</Aviso>}
    </form>
  );
}
