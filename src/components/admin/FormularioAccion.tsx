"use client";

import { useActionState } from "react";
import type { Resultado } from "@/app/(admin)/admin/acciones";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

type Accion = (previo: Resultado, datos: FormData) => Promise<Resultado>;

/** Formulario administrativo con su estado, aviso y secreto de un solo uso. */
export function FormularioAccion({
  accion,
  etiquetaEnvio,
  children,
}: {
  accion: Accion;
  etiquetaEnvio: string;
  children: React.ReactNode;
}) {
  const [estado, ejecutar] = useActionState<Resultado, FormData>(accion, {});

  return (
    <form action={ejecutar} className="space-y-4">
      {children}
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}
      {estado.secreto && (
        <div className="rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-[var(--color-papel-hondo)] px-4 py-3">
          <p className="font-mono text-[14px] leading-relaxed break-all">{estado.secreto}</p>
        </div>
      )}
      <BotonEnviar ocupado="Guardando…">{etiquetaEnvio}</BotonEnviar>
    </form>
  );
}
