"use client";

import { useActionState } from "react";
import { calificarEpisodio, type Resultado } from "@/app/(integrante)/discucharla/acciones";
import { Aviso } from "@/components/ui/Aviso";

const VALORES = [1, 2, 3, 4, 5];

export function Calificacion({
  sesion,
  miCalificacion,
  promedio,
}: {
  sesion: string;
  miCalificacion: number | null;
  promedio: number | null;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(calificarEpisodio, {});

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="sesion" value={sesion} />
      <h2 className="editorial text-[1.5rem]">¿Qué te pareció el episodio?</h2>

      <fieldset disabled={pendiente} className="flex gap-2">
        <legend className="sr-only">Tu calificación, de 1 a 5</legend>
        {VALORES.map((v) => {
          const activa = (miCalificacion ?? 0) >= v;
          return (
            <button
              key={v}
              type="submit"
              name="valor"
              value={v}
              aria-label={`${v} de 5`}
              aria-pressed={miCalificacion === v}
              className={`flex h-12 w-12 items-center justify-center rounded-full border text-[18px] transition ${
                activa
                  ? "border-transparent bg-[var(--color-club)] text-white"
                  : "border-[var(--color-linea)] bg-white/70 text-[var(--color-tinta-suave)]"
              }`}
            >
              ★
            </button>
          );
        })}
      </fieldset>

      <p className="text-[15px] text-[var(--color-tinta-suave)]">
        {promedio !== null
          ? `El club le puso ${promedio} de 5 en promedio.`
          : "Todavía nadie lo ha calificado."}
      </p>
      {estado.error && <Aviso>{estado.error}</Aviso>}
    </form>
  );
}
