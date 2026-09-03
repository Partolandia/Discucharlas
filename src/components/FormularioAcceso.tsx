"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrar, type EstadoFormulario } from "@/app/entrar/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function FormularioAcceso({ volver }: { volver?: string }) {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(entrar, {});

  return (
    <form action={accion} className="space-y-5">
      {volver && <input type="hidden" name="volver" value={volver} />}

      <Campo
        etiqueta="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="tu@correo.com"
      />
      <Campo
        etiqueta="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {estado.error && <Aviso>{estado.error}</Aviso>}

      <BotonEnviar ocupado="Entrando…">Entrar</BotonEnviar>

      <Link
        href="/entrar/recuperar"
        className="block text-center text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Olvidé mi contraseña
      </Link>
    </form>
  );
}
