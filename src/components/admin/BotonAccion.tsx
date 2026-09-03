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
}: {
  accion: Accion;
  campos: Record<string, string>;
  children: React.ReactNode;
  confirmacion?: string;
  tono?: "normal" | "principal" | "delicado";
}) {
  const [estado, ejecutar, pendiente] = useActionState<Resultado, FormData>(accion, {});
  const [confirmando, setConfirmando] = useState(false);

  const estilos = {
    normal: "border border-[var(--color-linea)] bg-[var(--color-blanco)]",
    principal: "text-white",
    delicado: "border",
  }[tono];

  const color =
    tono === "principal"
      ? { background: "var(--color-tinta)" }
      : tono === "delicado"
        ? { borderColor: "var(--color-error)", color: "var(--color-error)" }
        : undefined;

  return (
    <form action={ejecutar} className="inline-block">
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}

      {confirmacion && confirmando ? (
        <span className="flex flex-col gap-2 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-[var(--color-papel-hondo)] px-4 py-3">
          <span className="text-[14px] leading-relaxed">{confirmacion}</span>
          <span className="flex gap-2">
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
              style={{ background: "var(--color-error)" }}
            >
              Sí, hazlo
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-full border border-[var(--color-linea)] px-4 py-1.5 text-[13px]"
            >
              Mejor no
            </button>
          </span>
        </span>
      ) : (
        <button
          type={confirmacion ? "button" : "submit"}
          onClick={confirmacion ? () => setConfirmando(true) : undefined}
          disabled={pendiente}
          className={`rounded-full px-4 py-1.5 text-[13px] font-medium disabled:opacity-60 ${estilos}`}
          style={color}
        >
          {pendiente ? "Un momento…" : children}
        </button>
      )}

      {estado.error && (
        <div className="mt-2">
          <Aviso>{estado.error}</Aviso>
        </div>
      )}
      {estado.exito && (
        <div className="mt-2">
          <Aviso tono="exito">{estado.exito}</Aviso>
        </div>
      )}
      {estado.secreto && <Secreto valor={estado.secreto} />}
    </form>
  );
}

/** Muestra un valor que solo existe una vez: hay que copiarlo ahora. */
function Secreto({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mt-2 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-[var(--color-papel-hondo)] px-4 py-3">
      <p className="font-mono text-[14px] leading-relaxed break-all">{valor}</p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(valor).then(
            () => setCopiado(true),
            () => setCopiado(false)
          );
        }}
        className="mt-2 text-[13px] underline underline-offset-4"
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
