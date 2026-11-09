"use client";

import { useRef, useState } from "react";

/**
 * Campo de portada del prototipo: elegir archivo, ver la miniatura y quitarla.
 *
 * Mientras no se toque, el servidor no cambia nada. "Quitar imagen" manda
 * `quitar=1` para distinguir "déjala como está" de "bórrala".
 */
export function SelectorDePortada({
  actual,
  etiqueta = "PORTADA · OPCIONAL",
  ayuda,
  id = "portada",
  idImagen,
  idQuitar,
}: {
  actual: string | null;
  etiqueta?: string;
  ayuda?: string;
  id?: string;
  idImagen?: string;
  idQuitar?: string;
}) {
  const archivo = useRef<HTMLInputElement>(null);
  const [vista, setVista] = useState<string | null>(actual);
  const [quitada, setQuitada] = useState(false);

  return (
    <>
      <label className="club-label" htmlFor={id}>
        {etiqueta}
      </label>
      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        id={id}
        name="portada"
        ref={archivo}
        type="file"
        onChange={(e) => {
          const elegido = e.target.files?.[0];
          setVista(elegido ? URL.createObjectURL(elegido) : actual);
          setQuitada(false);
        }}
      />
      {ayuda && <small className="club-muted field-help">{ayuda}</small>}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Portada elegida"
        className="club-cover"
        hidden={!vista}
        id={idImagen}
        src={vista ?? undefined}
      />

      {quitada && <input name="quitarPortada" type="hidden" value="1" />}

      <button
        className="club-back"
        hidden={!vista && !quitada}
        id={idQuitar}
        type="button"
        onClick={() => {
          if (archivo.current) archivo.current.value = "";
          setVista(null);
          setQuitada(Boolean(actual));
        }}
      >
        Quitar imagen
      </button>
    </>
  );
}
