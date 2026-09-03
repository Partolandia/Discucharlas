"use client";

import { useActionState } from "react";
import { guardarNuevaContrasena, type EstadoFormulario } from "@/app/entrar/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function FormularioNuevaContrasena() {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(
    guardarNuevaContrasena,
    {}
  );

  return (
    <form action={accion} className="space-y-5">
      <Campo
        etiqueta="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        ayuda="Al menos 8 caracteres."
      />
      <Campo
        etiqueta="Repítela"
        name="confirmacion"
        type="password"
        autoComplete="new-password"
        required
      />
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <BotonEnviar ocupado="Guardando…">Guardar contraseña</BotonEnviar>
    </form>
  );
}
