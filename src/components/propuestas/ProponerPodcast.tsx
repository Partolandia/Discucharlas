"use client";

import { useActionState } from "react";
import {
  proponerPodcast,
  editarPropuesta,
  type Resultado,
} from "@/app/(integrante)/propuestas/acciones";

export type PropuestaEditable = {
  id: string;
  episodio: string;
  podcast: string | null;
  url: string | null;
  duracion: string | null;
  descripcion: string | null;
};

/** El mismo formulario sirve para proponer y para editar. */
export function ProponerPodcast({ propuesta }: { propuesta?: PropuestaEditable }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(
    propuesta ? editarPropuesta : proponerPodcast,
    {}
  );

  return (
    <form action={accion} className="club-panel">
      {propuesta && <input type="hidden" name="propuesta" value={propuesta.id} />}

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
        defaultValue={propuesta?.episodio}
      />

      <label className="club-label" htmlFor="podcast">
        NOMBRE DEL PODCAST · OPCIONAL
      </label>
      <input
        className="form-input"
        id="podcast"
        name="podcast"
        type="text"
        maxLength={200}
        defaultValue={propuesta?.podcast ?? ""}
      />
      <small className="club-muted">El programa al que pertenece este episodio.</small>

      <label className="club-label" htmlFor="url">
        ENLACE DEL EPISODIO · OPCIONAL
      </label>
      <input
        className="form-input"
        id="url"
        name="url"
        type="text"
        maxLength={2000}
        defaultValue={propuesta?.url ?? ""}
      />
      <small className="club-muted">La dirección para escuchar este episodio específico.</small>

      <label className="club-label" htmlFor="duracion">
        DURACIÓN · OPCIONAL
      </label>
      <input
        className="form-input"
        id="duracion"
        name="duracion"
        type="text"
        maxLength={50}
        defaultValue={propuesta?.duracion ?? ""}
      />

      <label className="club-label" htmlFor="descripcion">
        BREVE RESEÑA · OPCIONAL
      </label>
      <textarea
        className="form-input"
        id="descripcion"
        name="descripcion"
        maxLength={4000}
        rows={4}
        defaultValue={propuesta?.descripcion ?? ""}
      />

      <p className="club-message" role="status" aria-live="polite">
        {estado.error ?? estado.exito}
      </p>

      <button className="club-button" type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : propuesta ? "Guardar cambios" : "Guardar propuesta"}
      </button>
    </form>
  );
}
