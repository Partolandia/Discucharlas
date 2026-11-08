"use client";

import { useActionState } from "react";
import { guardarNotaPrivada, type Resultado } from "@/app/(integrante)/discucharla/acciones";

export function NotaPrivada({ sesion, nota }: { sesion: string; nota: string }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(guardarNotaPrivada, {});

  return (
    <form action={accion} className="content-card session-card session-card-notes">
      <input type="hidden" name="sesion" value={sesion} />
      <span className="mini-kicker">SOLO PARA TI</span>
      <h2>Mis notas privadas</h2>
      <p>Guarda ideas, preguntas o frases mientras escuchas. Solo tú puedes verlas.</p>
      <textarea
        className="note-box"
        name="texto"
        defaultValue={nota}
        maxLength={10000}
        placeholder="¿Qué ideas quieres recordar?"
      />
      <div className="save-state">
        {pendiente ? "Guardando…" : (estado.error ?? estado.exito ?? "Guarda cuando termines")}
      </div>
      <button className="club-button" type="submit" disabled={pendiente}>
        Guardar nota
      </button>
    </form>
  );
}
