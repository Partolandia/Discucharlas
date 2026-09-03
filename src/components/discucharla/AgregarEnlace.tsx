"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { agregarEnlace, type Resultado } from "@/app/(integrante)/discucharla/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function AgregarEnlace({ sesion }: { sesion: string }) {
  const [estado, accion] = useActionState<Resultado, FormData>(agregarEnlace, {});
  const [abierto, setAbierto] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="text-[16px] font-medium underline underline-offset-4"
      >
        Compartir un enlace
      </button>
    );
  }

  return (
    <form ref={formulario} action={accion} className="space-y-4">
      <input type="hidden" name="sesion" value={sesion} />
      <Campo etiqueta="Título" name="titulo" required maxLength={160} placeholder="El artículo que mencionamos" />
      <Campo etiqueta="Enlace" name="url" type="url" required placeholder="https://" />
      <BotonEnviar ocupado="Guardando…">Compartir</BotonEnviar>
      {estado.error && <Aviso>{estado.error}</Aviso>}
    </form>
  );
}
