"use client";

import { useActionState, useRef, useState } from "react";
import {
  guardarSeccionDeGuia,
  type Resultado,
} from "@/app/(integrante)/guia/acciones";
import type { SeccionGuia } from "@/lib/guia";

/**
 * Una tarjeta de la guía. Administración la edita en el sitio, como el
 * prototipo: el bloque se vuelve `contentEditable` y al guardar se manda su
 * HTML, que el servidor sanea antes de escribirlo.
 */
export function TarjetaGuia({
  seccion,
  numero,
  titulo,
  acento,
  clase,
  claseCuerpo,
  esAdmin,
  guardado,
  children,
}: {
  seccion: SeccionGuia;
  numero: string;
  titulo: string;
  acento: string;
  clase: string;
  claseCuerpo?: string;
  esAdmin: boolean;
  /** Lo que escribió administración. Si no hay, se usa el texto original. */
  guardado: string | null;
  children: React.ReactNode;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(
    guardarSeccionDeGuia,
    {}
  );
  const bloque = useRef<HTMLDivElement>(null);
  const [editando, setEditando] = useState(false);
  const [original, setOriginal] = useState("");

  return (
    <article
      className={`guide-card ${clase}`}
      data-guide-card={seccion}
      style={{ ["--guide-accent" as string]: acento }}
    >
      <div className="guide-card-head">
        <div>
          <span className="guide-kicker">{numero}</span>
          <h2>{titulo}</h2>
        </div>
        {esAdmin && (
          <button
            className="guide-edit-btn admin-only-field"
            data-admin-only="control"
            data-guide-edit={seccion}
            hidden={editando}
            style={{ display: editando ? "none" : "block" }}
            type="button"
            onClick={() => {
              setOriginal(bloque.current?.innerHTML ?? "");
              setEditando(true);
              queueMicrotask(() => bloque.current?.focus());
            }}
          >
            Editar
          </button>
        )}
      </div>

      <div
        className={`guide-editable${claseCuerpo ? ` ${claseCuerpo}` : ""}`}
        contentEditable={editando}
        data-guide-content={seccion}
        ref={bloque}
        suppressContentEditableWarning
        {...(guardado ? { dangerouslySetInnerHTML: { __html: guardado } } : {})}
      >
        {guardado ? undefined : children}
      </div>

      {esAdmin && (
        <form
          action={(datos) => {
            datos.set("cuerpo", bloque.current?.innerHTML ?? "");
            setEditando(false);
            return accion(datos);
          }}
          className="guide-edit-actions"
          data-guide-actions={seccion}
          hidden={!editando}
        >
          <input type="hidden" name="seccion" value={seccion} />
          <input type="hidden" name="titulo" value={titulo} />
          <button
            className="mini-btn primary"
            data-admin-only="control"
            data-guide-save={seccion}
            disabled={pendiente}
            type="submit"
          >
            Guardar
          </button>
          <button
            className="mini-btn"
            data-admin-only="control"
            data-guide-cancel={seccion}
            type="button"
            onClick={() => {
              if (bloque.current) bloque.current.innerHTML = original;
              setEditando(false);
            }}
          >
            Cancelar
          </button>
        </form>
      )}

      {(estado.error ?? estado.exito) && (
        <p className="club-message" role="status" aria-live="polite">
          {estado.error ?? estado.exito}
        </p>
      )}
    </article>
  );
}
