"use client";

import { useRouter } from "next/navigation";

/** La línea de regreso que el prototipo pone arriba de cada subpantalla. */
export function Backline({
  a,
  texto,
  etiqueta,
  clase,
  idBoton,
  idTexto,
}: {
  a: string;
  texto: string;
  etiqueta?: string;
  /** p. ej. "backline-home" en el Historial. */
  clase?: string;
  idBoton?: string;
  idTexto?: string;
}) {
  const router = useRouter();
  const ir = () => router.push(a);

  return (
    <div
      className={`backline backline-link${clase ? ` ${clase}` : ""}`}
      role="button"
      tabIndex={0}
      onClick={ir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ir();
        }
      }}
    >
      <button aria-label={etiqueta ?? texto} id={idBoton} type="button">
        ‹
      </button>
      <span id={idTexto}>{texto}</span>
    </div>
  );
}
