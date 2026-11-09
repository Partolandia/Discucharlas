"use client";

import { useActionState, useState } from "react";
import type { Resultado } from "@/app/(admin)/admin/acciones";
import { Aviso } from "@/components/ui/Aviso";

type Accion = (previo: Resultado, datos: FormData) => Promise<Resultado>;

/**
 * Botón que dispara una acción administrativa.
 *
 * Cuando la acción es delicada pide confirmación en dos pasos y explica la
 * consecuencia antes de ejecutarla, que es lo que pide el documento maestro.
 */
export function BotonAccion({
  accion,
  campos,
  children,
  confirmacion,
  tono = "normal",
  clase: claseDada,
  id,
}: {
  accion: Accion;
  campos: Record<string, string>;
  children: React.ReactNode;
  confirmacion?: string;
  tono?: "normal" | "principal" | "delicado";
  /** Para las zonas que usan los botones del prototipo (`club-button`). */
  clase?: string;
  id?: string;
}) {
  const [estado, ejecutar, pendiente] = useActionState<Resultado, FormData>(accion, {});
  const [confirmando, setConfirmando] = useState(false);

  const clase =
    claseDada ??
    {
      normal: "mini-btn",
      principal: "mini-btn role-action",
      delicado: "mini-btn danger",
    }[tono];

  return (
    <form action={ejecutar}>
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}

      {confirmacion && confirmando ? (
        <span className="club-panel">
          <small>{confirmacion}</small>
          <span className="admin-actions">
            <button className="mini-btn danger" type="submit" disabled={pendiente}>
              Sí, hazlo
            </button>
            <button className="mini-btn" type="button" onClick={() => setConfirmando(false)}>
              Mejor no
            </button>
          </span>
        </span>
      ) : (
        <button
          className={clase}
          id={id}
          data-admin-only="control"
          type={confirmacion ? "button" : "submit"}
          onClick={confirmacion ? () => setConfirmando(true) : undefined}
          disabled={pendiente}
        >
          {pendiente ? "Un momento…" : children}
        </button>
      )}

      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}
      {estado.secreto && <Secreto valor={estado.secreto} />}
    </form>
  );
}

/** Muestra un valor que solo existe una vez: hay que copiarlo ahora. */
function Secreto({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="club-panel">
      <p className="code-box">{valor}</p>
      <button
        className="mini-btn"
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(valor).then(
            () => setCopiado(true),
            () => setCopiado(false)
          );
        }}
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
