"use client";

import { useActionState } from "react";
import { alternarVoto, type Resultado } from "@/app/(integrante)/propuestas/acciones";

/** Opción de votación del prototipo v2: portada, título, conteo y reseña. */
export function BotonVoto({
  ronda,
  propuesta,
  votada,
  titulo,
  podcast,
  resena,
  portada,
  votos,
  cerrada,
}: {
  ronda: string;
  propuesta: string;
  votada: boolean;
  titulo: string;
  podcast: string | null;
  resena: string | null;
  portada: string | null;
  votos: number;
  cerrada?: boolean;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(alternarVoto, {});

  return (
    <form action={accion}>
      <input type="hidden" name="ronda" value={ronda} />
      <input type="hidden" name="propuesta" value={propuesta} />
      <button
        type="submit"
        disabled={pendiente || cerrada}
        aria-pressed={votada}
        className={`club-vote-option${votada ? " on" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {portada && <img src={portada} alt="" />}
        <span>
          <strong>{titulo}</strong>
          <small>
            {podcast ? `${podcast} · ` : ""}
            {votos} {votos === 1 ? "voto" : "votos"}
          </small>
          <span>{resena}</span>
        </span>
        <b>{votada ? "✓" : "○"}</b>
      </button>
      {estado.error && (
        <p className="club-message" role="status">
          {estado.error}
        </p>
      )}
    </form>
  );
}
