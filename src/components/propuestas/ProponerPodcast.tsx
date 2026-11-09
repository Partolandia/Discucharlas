"use client";

import { useActionState } from "react";
import { SelectorDePortada } from "@/components/ui/SelectorDePortada";
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
  portada: string | null;
};

/** El mismo formulario sirve para proponer y para editar. */
export function ProponerPodcast({ propuesta }: { propuesta?: PropuestaEditable }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(
    propuesta ? editarPropuesta : proponerPodcast,
    {}
  );

  return (
    <form action={accion} className="club-panel" id="clubProposalForm">
      {propuesta && <input type="hidden" name="propuesta" value={propuesta.id} />}

      <label className="club-label" htmlFor="clubProp-title">
        TÍTULO DEL EPISODIO
      </label>
      <input
        className="form-input"
        id="clubProp-title"
        name="episodio"
        type="text"
        maxLength={200}
        required
        placeholder="La física del duelo"
        defaultValue={propuesta?.episodio}
      />

      <label className="club-label" htmlFor="clubProp-podcast">
        NOMBRE DEL PODCAST · OPCIONAL
      </label>
      <input
        className="form-input"
        id="clubProp-podcast"
        name="podcast"
        type="text"
        maxLength={200}
        defaultValue={propuesta?.podcast ?? ""}
      />
      <small className="club-muted">El programa al que pertenece este episodio.</small>

      <label className="club-label" htmlFor="clubProp-episode_url">
        ENLACE DEL EPISODIO · OPCIONAL
      </label>
      <input
        className="form-input"
        id="clubProp-episode_url"
        name="url"
        type="text"
        maxLength={2000}
        defaultValue={propuesta?.url ?? ""}
      />
      <small className="club-muted">La dirección para escuchar este episodio específico.</small>

      <label className="club-label" htmlFor="clubProp-duration">
        DURACIÓN · OPCIONAL
      </label>
      <input
        className="form-input"
        id="clubProp-duration"
        name="duracion"
        type="text"
        maxLength={50}
        defaultValue={propuesta?.duracion ?? ""}
      />

      <label className="club-label" htmlFor="clubProp-review">
        BREVE RESEÑA · OPCIONAL
      </label>
      <textarea
        className="form-input"
        id="clubProp-review"
        name="descripcion"
        maxLength={4000}
        rows={4}
        defaultValue={propuesta?.descripcion ?? ""}
      />

      <SelectorDePortada
        actual={propuesta?.portada ?? null}
        id="clubPropFile"
        idImagen="clubPropImage"
        idQuitar="clubPropRemoveImage"
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
