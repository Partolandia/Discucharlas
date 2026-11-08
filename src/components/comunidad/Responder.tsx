"use client";

import { useActionState, useEffect, useRef } from "react";
import { responder, type Resultado } from "@/app/(integrante)/comunidad/acciones";

export function Responder({ hilo }: { hilo: string }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(responder, {});
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion} className="community-reply-compose">
      <input type="hidden" name="hilo" value={hilo} />
      <label htmlFor="cuerpo" className="sr-only">
        Tu respuesta
      </label>
      <textarea
        className="reply-box"
        id="cuerpo"
        name="cuerpo"
        maxLength={4000}
        placeholder="Escribe una respuesta..."
      />
      <button className="community-publish" type="submit" disabled={pendiente}>
        {pendiente ? "Publicando…" : "Publicar respuesta"}
      </button>
      {estado.error && (
        <p className="club-message" role="status">
          {estado.error}
        </p>
      )}
    </form>
  );
}
