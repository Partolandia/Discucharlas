"use client";

import { useRef, useState } from "react";

/**
 * `#createCoverWrap` del prototipo: la zona cuadrada con el “＋” que se vuelve
 * previsualización al elegir una imagen.
 */
export function PortadaDiscucharla({ actual = null }: { actual?: string | null }) {
  const archivo = useRef<HTMLInputElement>(null);
  const [vista, setVista] = useState<string | null>(actual);

  return (
    <div className="create-field create-cover-field">
      <label htmlFor="createCoverInput">IMAGEN DE LA DISCUCHARLA</label>
      <div id="createCoverWrap">
        <label htmlFor="createCoverInput" id="createCoverDrop">
          <span aria-hidden="true" id="createCoverPlaceholder" style={vista ? ocultar : undefined}>
            ＋
          </span>
          {/* El CSS del prototipo los trae en `display:none` y los enciende
              desde JS; aquí el estado decide el `display`. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Previsualización de la imagen de la Discucharla"
            id="createCoverPreview"
            src={vista ?? undefined}
            style={vista ? mostrar : ocultar}
          />
          <span>
            <b>Subir imagen</b>
            <small>Portada para menús y ficha. Recomendado: imagen cuadrada.</small>
          </span>
        </label>
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          id="createCoverInput"
          name="portada"
          ref={archivo}
          type="file"
          onChange={(e) => {
            const elegido = e.target.files?.[0];
            setVista(elegido ? URL.createObjectURL(elegido) : null);
          }}
        />
        <button
          data-admin-only="control"
          id="createCoverRemove"
          style={vista ? mostrar : ocultar}
          type="button"
          onClick={() => {
            if (archivo.current) archivo.current.value = "";
            setVista(null);
          }}
        >
          Quitar imagen
        </button>
      </div>
    </div>
  );
}

const mostrar = { display: "block" } as const;
const ocultar = { display: "none" } as const;
