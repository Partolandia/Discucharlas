"use client";

import { useActionState } from "react";
import { pedirRecuperacion, type EstadoFormulario } from "@/app/entrar/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function FormularioRecuperar() {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(pedirRecuperacion, {});

  if (estado.exito) {
    return <Aviso tono="exito">{estado.exito}</Aviso>;
  }

  return (
    <form action={accion} className="space-y-5">
      <Campo etiqueta="Correo" name="email" type="email" autoComplete="email" required />
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <BotonEnviar ocupado="Enviando…">Enviarme el enlace</BotonEnviar>
    </form>
  );
}
