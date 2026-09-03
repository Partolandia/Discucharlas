"use client";

import { useActionState, useEffect, useRef } from "react";
import { responder, type Resultado } from "@/app/(integrante)/comunidad/acciones";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function Responder({ hilo }: { hilo: string }) {
  const [estado, accion] = useActionState<Resultado, FormData>(responder, {});
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion} className="space-y-3">
      <input type="hidden" name="hilo" value={hilo} />
      <label htmlFor="cuerpo" className="sr-only">
        Tu respuesta
      </label>
      <textarea
        id="cuerpo"
        name="cuerpo"
        rows={3}
        maxLength={4000}
        placeholder="Responder…"
        className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
      />
      <BotonEnviar ocupado="Publicando…">Responder</BotonEnviar>
      {estado.error && <Aviso>{estado.error}</Aviso>}
    </form>
  );
}
