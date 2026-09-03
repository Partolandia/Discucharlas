"use client";

import { useActionState, useRef, useEffect } from "react";
import { comentar, type Resultado } from "@/app/(integrante)/discucharla/acciones";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function Comentar({ sesion }: { sesion: string }) {
  const [estado, accion] = useActionState<Resultado, FormData>(comentar, {});
  const formulario = useRef<HTMLFormElement>(null);

  // Al publicar sin error, dejamos el campo limpio para el siguiente comentario.
  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion} className="space-y-3">
      <input type="hidden" name="sesion" value={sesion} />
      <label htmlFor="cuerpo" className="sr-only">
        Tu comentario
      </label>
      <textarea
        id="cuerpo"
        name="cuerpo"
        rows={3}
        maxLength={4000}
        placeholder="Comparte algo con el club…"
        className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
      />
      <BotonEnviar ocupado="Publicando…">Comentar</BotonEnviar>
      {estado.error && <Aviso>{estado.error}</Aviso>}
    </form>
  );
}
