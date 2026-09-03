"use client";

import { useActionState } from "react";
import { entrarComoInvitada, type Resultado } from "@/app/invitada/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function FormularioInvitada() {
  const [estado, accion] = useActionState<Resultado, FormData>(entrarComoInvitada, {});

  return (
    <form action={accion} className="space-y-5">
      <Campo
        etiqueta="Tu clave"
        name="clave"
        required
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="XXXX-XXXX"
      />
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <BotonEnviar ocupado="Entrando…">Ver la próxima discucharla</BotonEnviar>
    </form>
  );
}
