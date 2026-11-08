"use client";

import { useActionState } from "react";
import { proponerPodcast, type Resultado } from "@/app/(integrante)/propuestas/acciones";

export function ProponerPodcast() {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(proponerPodcast, {});

  return (
    <form action={accion} className="club-panel">
      <label className="club-label" htmlFor="episodio">
        TÍTULO DEL EPISODIO
      </label>
      <input
        className="form-input"
        id="episodio"
        name="episodio"
        type="text"
        maxLength={200}
        required
        placeholder="La física del duelo"
      />

      <label className="club-label" htmlFor="podcast">
        NOMBRE DEL PODCAST · OPCIONAL
      </label>
      <input className="form-input" id="podcast" name="podcast" type="text" maxLength={200} />
      <small className="club-muted">El programa al que pertenece este episodio.</small>

      <label className="club-label" htmlFor="url">
        ENLACE DEL EPISODIO · OPCIONAL
      </label>
      <input className="form-input" id="url" name="url" type="text" maxLength={2000} />
      <small className="club-muted">La dirección para escuchar este episodio específico.</small>

      <label className="club-label" htmlFor="duracion">
        DURACIÓN · OPCIONAL
      </label>
      <input className="form-input" id="duracion" name="duracion" type="text" maxLength={50} />

      <label className="club-label" htmlFor="descripcion">
        BREVE RESEÑA · OPCIONAL
      </label>
      <textarea
        className="form-input"
        id="descripcion"
        name="descripcion"
        maxLength={4000}
        rows={4}
      />

      <p className="club-message" role="status" aria-live="polite">
        {estado.error ?? estado.exito}
      </p>

      <button className="club-button" type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : "Guardar propuesta"}
      </button>
    </form>
  );
}
