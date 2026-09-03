"use client";

import { useActionState } from "react";
import { aceptarInvitacion, type Resultado } from "@/app/invitacion/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function FormularioInvitacion({
  token,
  nombre,
}: {
  token: string;
  nombre: string;
}) {
  const [estado, accion] = useActionState<Resultado, FormData>(aceptarInvitacion, {});

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <Campo etiqueta="Nombre" name="nombre" defaultValue={nombre} required maxLength={80} />
      <Campo etiqueta="Apellido" name="apellido" maxLength={80} />
      <Campo
        etiqueta="Teléfono"
        name="telefono"
        type="tel"
        required
        maxLength={40}
        ayuda="Solo lo ven las administradoras del club."
      />
      <Campo
        etiqueta="Contraseña"
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

      <BotonEnviar ocupado="Creando tu cuenta…">Entrar al club</BotonEnviar>
    </form>
  );
}
