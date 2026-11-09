"use client";

import { useActionState, useState } from "react";
import { revocarInvitacion, type Resultado } from "@/app/(admin)/admin/acciones";

export type Ingreso = {
  id: string;
  nombre: string;
  /** Null cuando el enlace ya no se puede volver a mostrar. */
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
 * Tarjeta de un ingreso de integrante, con el formato compacto del prototipo
 * v2: el enlace en una línea, "Copiar enlace" a la vista y el resto de
 * acciones dentro de "Más".
 */
export function TarjetaIngreso({ ingreso }: { ingreso: Ingreso }) {
  const usable = ingreso.estado === "active" && Boolean(ingreso.enlace);

  return (
    <article className="entry-card">
      <h3>{ingreso.nombre}</h3>

      <div className="entry-state-line">
        <span className={`entry-state ${ingreso.estado}`}>{ETIQUETA[ingreso.estado]}</span>
        <small>{ingreso.detalle}</small>
      </div>

      {usable && <Controles ingreso={ingreso} />}

      {ingreso.estado === "used" && (
        <p className="entry-used">Este ingreso ya no permite crear otra cuenta.</p>
      )}

      {/*
       * La base guarda el token cifrado, así que un enlace ya creado no se
       * puede volver a mostrar. Es a propósito: si se perdió, se crea otro.
       */}
      {ingreso.estado === "active" && !ingreso.enlace && (
        <>
          <p className="entry-used">
            El enlace solo se muestra al crearlo. Si se perdió, desactívalo y crea uno nuevo.
          </p>
          <Desactivar id={ingreso.id} />
        </>
      )}
    </article>
  );
}

function Desactivar({ id }: { id: string }) {
  const [, revocar, revocando] = useActionState<Resultado, FormData>(revocarInvitacion, {});

  return (
    <form action={revocar}>
      <input type="hidden" name="invitacion" value={id} />
      <button className="entry-renew" type="submit" disabled={revocando}>
        {revocando ? "Un momento…" : "Desactivar enlace"}
      </button>
    </form>
  );
}

function Controles({ ingreso }: { ingreso: Ingreso }) {
  const enlace = ingreso.enlace as string;
  const [copiado, setCopiado] = useState(false);
  const [, revocar, revocando] = useActionState<Resultado, FormData>(revocarInvitacion, {});

  return (
    <>
      <input className="entry-link" type="text" readOnly aria-label="Enlace de ingreso" value={enlace} />
      <div className="entry-actions">
        <button
          className="entry-copy"
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
          <a className="entry-open" href={enlace} target="_blank" rel="noopener noreferrer">
            Abrir enlace ↗
          </a>
          <form action={revocar}>
            <input type="hidden" name="invitacion" value={ingreso.id} />
            <button type="submit" disabled={revocando}>
              {revocando ? "Un momento…" : "Desactivar enlace"}
            </button>
          </form>
        </details>
      </div>
    </>
  );
}
