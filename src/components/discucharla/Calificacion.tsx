"use client";

import { useActionState } from "react";
import { calificarEpisodio, type Resultado } from "@/app/(integrante)/discucharla/acciones";

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
    <form action={accion} className="content-card session-card club-rating">
      <input type="hidden" name="sesion" value={sesion} />
      <div className="club-kicker">DESPUÉS DEL ENCUENTRO</div>
      <h3>¿Qué te pareció el podcast?</h3>
      <p className="club-muted">
        {promedio !== null
          ? `El club le puso ${promedio} de 5 en promedio.`
          : "Todavía no hay calificaciones."}
      </p>
      <fieldset className="club-stars" disabled={pendiente}>
        <legend className="sr-only">Tu calificación, de 1 a 5</legend>
        {VALORES.map((v) => (
          <button
            key={v}
            type="submit"
            name="valor"
            value={v}
            aria-label={`Calificar con ${v} estrellas`}
            aria-pressed={miCalificacion === v}
            className={(miCalificacion ?? 0) >= v ? "on" : undefined}
          >
            ★
          </button>
        ))}
      </fieldset>
      <p className="club-muted">
        Tu calificación puede cambiar. Se muestra el promedio del club.
      </p>
      <p className="club-message" role="status" aria-live="polite">
        {estado.error}
      </p>
    </form>
  );
}
