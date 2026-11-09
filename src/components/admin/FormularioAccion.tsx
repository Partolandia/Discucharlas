"use client";

import { useActionState } from "react";
import type { Resultado } from "@/app/(admin)/admin/acciones";
import { Aviso } from "@/components/ui/Aviso";

type Accion = (previo: Resultado, datos: FormData) => Promise<Resultado>;

/** Formulario administrativo con su estado, aviso y secreto de un solo uso. */
export function FormularioAccion({
  accion,
  etiquetaEnvio,
  children,
  clase = "new",
  id,
  avisoAlPie = false,
}: {
  accion: Accion;
  etiquetaEnvio: string;
  children: React.ReactNode;
  /** Para las zonas que usan los botones del prototipo (`club-button`). */
  clase?: string;
  id?: string;
  /** Crear Discucharla pone el resultado debajo del botón, no arriba. */
  avisoAlPie?: boolean;
}) {
  const [estado, ejecutar, pendiente] = useActionState<Resultado, FormData>(accion, {});
  const mensaje = estado.error ?? estado.exito;

  return (
    <form action={ejecutar} className="admin-flow">
      {children}
      {!avisoAlPie && estado.error && <Aviso>{estado.error}</Aviso>}
      {!avisoAlPie && estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}
      {estado.secreto && <p className="code-box">{estado.secreto}</p>}
      <button className={clase} id={id} data-admin-only="control" type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : etiquetaEnvio}
      </button>
      {avisoAlPie && (
        <p aria-live="polite" className="cloud-inline-feedback" role="status">
          {mensaje}
        </p>
      )}
    </form>
  );
}
