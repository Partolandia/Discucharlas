"use client";

import { useActionState, useRef, useEffect } from "react";
import { comentar, type Resultado } from "@/app/(integrante)/discucharla/acciones";

export function Comentar({ sesion }: { sesion: string }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(comentar, {});
  const formulario = useRef<HTMLFormElement>(null);

  // Al publicar sin error, dejamos el campo limpio para el siguiente comentario.
  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion}>
      <input type="hidden" name="sesion" value={sesion} />
      <div className="comment-compose">
        <label className="sr-only" htmlFor="cuerpo">
          Tu comentario
        </label>
        <input id="cuerpo" name="cuerpo" maxLength={4000} placeholder="Escribe un comentario" />
        <button type="submit" disabled={pendiente}>
          Publicar
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
