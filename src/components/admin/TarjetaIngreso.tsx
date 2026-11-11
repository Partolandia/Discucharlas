"use client";

import { useActionState, useState } from "react";
import {
  renovarInvitacion,
  revocarInvitacion,
  type Resultado,
} from "@/app/(admin)/admin/acciones";

export type Ingreso = {
  id: string;
  nombre: string;
  /** Null solo en los ingresos creados antes de que se guardara el enlace. */
  enlace: string | null;
  estado: "active" | "used" | "revoked" | "expired";
  /** Línea de contexto: cuándo vence o cuándo se usó. */
  detalle: string;
};

const ETIQUETA: Record<Ingreso["estado"], string> = {
  active: "Disponible",
  used: "Utilizado",
  revoked: "Desactivado",
  expired: "Vencido",
};

/**
 * Ficha de un ingreso de integrante, con el formato del prototipo: el estado,
 * el enlace en una línea, "Copiar enlace" a la vista y el resto dentro de
 * "Más".
 */
export function TarjetaIngreso({ ingreso }: { ingreso: Ingreso }) {
  return (
    <article className="entry-card">
      <h3>{ingreso.nombre}</h3>
      <ControlesDeIngreso ingreso={ingreso} />
    </article>
  );
}

/**
 * Lo mismo, pero suelto: en el prototipo una solicitud aprobada muestra su
 * ingreso dentro de la propia tarjeta de la solicitud.
 */
export function ControlesDeIngreso({ ingreso }: { ingreso: Ingreso }) {
  const [copiado, setCopiado] = useState(false);
  const [, revocar, revocando] = useActionState<Resultado, FormData>(revocarInvitacion, {});
  const [, renovar, renovando] = useActionState<Resultado, FormData>(renovarInvitacion, {});
  const enlace = ingreso.enlace;

  return (
    <>
      <div className="entry-state-line">
        <span className={`entry-state ${ingreso.estado}`}>{ETIQUETA[ingreso.estado]}</span>
        <small>{ingreso.detalle}</small>
      </div>

      {enlace ? (
        <>
          <input
            aria-label="Enlace de ingreso"
            className="entry-link"
            readOnly
            type="text"
            value={enlace}
          />
          <div className="entry-actions">
            <button
              className="entry-copy"
              data-admin-only="control"
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(enlace).then(
                  () => setCopiado(true),
                  () => setCopiado(false)
                )
              }
            >
              {copiado ? "Copiado" : "Copiar enlace"}
            </button>

            <details className="entry-more">
              <summary>Más</summary>
              <a className="entry-open" href={enlace} rel="noopener noreferrer" target="_blank">
                Abrir enlace ↗
              </a>
              {ingreso.estado !== "used" && (
                <>
                  <form action={revocar}>
                    <input name="invitacion" type="hidden" value={ingreso.id} />
                    <button data-admin-only="control" disabled={revocando} type="submit">
                      {revocando ? "Un momento…" : "Desactivar enlace"}
                    </button>
                  </form>
                  <form action={renovar}>
                    <input name="invitacion" type="hidden" value={ingreso.id} />
                    <button data-admin-only="control" disabled={renovando} type="submit">
                      {renovando ? "Un momento…" : "Generar enlace nuevo"}
                    </button>
                  </form>
                </>
              )}
            </details>
          </div>
        </>
      ) : (
        /*
         * Los ingresos de antes de esta versión solo dejaron el hash, así que su
         * enlace no se puede reconstruir. Se genera otro y listo.
         */
        <div className="entry-actions">
          <form action={renovar}>
            <input name="invitacion" type="hidden" value={ingreso.id} />
            <button className="entry-copy" data-admin-only="control" disabled={renovando} type="submit">
              {renovando ? "Un momento…" : "Generar enlace nuevo"}
            </button>
          </form>
        </div>
      )}

      {ingreso.estado === "used" && (
        <p className="entry-used">Este ingreso ya no permite crear otra cuenta.</p>
      )}
    </>
  );
}
