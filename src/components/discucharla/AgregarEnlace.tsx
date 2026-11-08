"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { agregarEnlace, type Resultado } from "@/app/(integrante)/discucharla/acciones";
export function AgregarEnlace({ sesion }: { sesion: string }) {
  const [estado, accion] = useActionState<Resultado, FormData>(agregarEnlace, {});
  const [abierto, setAbierto] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  if (!abierto) {
    return (
      <div className="media-actions">
        <button type="button" onClick={() => setAbierto(true)}>
          ＋ Agregar material
        </button>
      </div>
    );
  }

  return (
    <form ref={formulario} action={accion}>
      <input type="hidden" name="sesion" value={sesion} />
      <label className="club-label" htmlFor="material-titulo">
        TÍTULO
      </label>
      <input
        className="form-input"
        id="material-titulo"
        name="titulo"
        required
        maxLength={160}
        placeholder="El artículo que mencionamos"
      />
      <label className="club-label" htmlFor="material-url">
        ENLACE
      </label>
      <input
        className="form-input"
        id="material-url"
        name="url"
        type="url"
        required
        placeholder="https://"
      />
      <div className="media-actions">
        <button type="submit">Compartir</button>
        <button type="button" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
      {estado.error && (
        <p className="club-message" role="status">
          {estado.error}
        </p>
      )}
    </form>
  );
}
