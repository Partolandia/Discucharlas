"use client";

import { useActionState } from "react";
import { responderAsistencia, type Resultado } from "@/app/(integrante)/discucharla/acciones";
import { RESPUESTAS_RSVP } from "@/lib/dominio";

export type ConteoRsvp = Record<string, string[]>;

export function Asistencia({
  sesion,
  miRespuesta,
  quienes,
  bloqueada,
}: {
  sesion: string;
  miRespuesta: string | null;
  quienes: ConteoRsvp;
  bloqueada?: boolean;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(responderAsistencia, {});

  if (bloqueada) return null;

  const total = Object.values(quienes).reduce((suma, lista) => suma + lista.length, 0);

  return (
    <form action={accion} className="content-card planning-section session-card session-card-rsvp">
      <input type="hidden" name="sesion" value={sesion} />
      <div className="club-kicker">ASISTENCIA</div>
      <h3>¿Vienes?</h3>
      <p className="club-muted">
        {total === 0
          ? "Todavía nadie responde. Puedes empezar tú."
          : `${total} ${total === 1 ? "respuesta" : "respuestas"} hasta ahora.`}
      </p>
      <fieldset className="poll-list" disabled={pendiente}>
        <legend className="sr-only">Tu respuesta</legend>
        {RESPUESTAS_RSVP.map((r) => {
          const elegida = miRespuesta === r.valor;
          const lista = quienes[r.valor] ?? [];
          return (
            <button
              key={r.valor}
              type="submit"
              name="respuesta"
              value={r.valor}
              aria-pressed={elegida}
              className={`poll-choice${elegida ? " on" : ""}`}
            >
              <span className="poll-radio" />
              <strong>{r.texto}</strong>
              <b className="poll-count">
                {lista.length} {lista.length === 1 ? "voto" : "votos"}
              </b>
              <small className="voters">{lista.length ? lista.join(", ") : "Nadie todavía"}</small>
            </button>
          );
        })}
      </fieldset>
      <p className="club-message" role="status" aria-live="polite">
        {estado.error}
      </p>
    </form>
  );
}
