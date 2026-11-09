"use client";

import { useActionState, useState } from "react";
import { guardarEncuadre, type Resultado } from "@/app/(admin)/admin/acciones";

/**
 * `#homeCoverTools` del prototipo: la portada es cuadrada y el hero una
 * franja, así que administración elige qué parte se ve.
 */
export function EncuadreDePortada({
  activo,
  sesion,
  x,
  y,
}: {
  /** Sin portada no hay nada que encuadrar: el bloque se queda oculto. */
  activo: boolean;
  sesion: string;
  x: number;
  y: number;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(guardarEncuadre, {});
  const [abierto, setAbierto] = useState(false);

  return (
    <div data-admin-only="panel" hidden={!activo} id="homeCoverTools">
      <button
        className="club-back"
        data-admin-only="control"
        id="homeFocusOpen"
        type="button"
        onClick={() => setAbierto(!abierto)}
      >
        Ajustar encuadre de la portada
      </button>

      <form action={accion} className="club-panel" hidden={!abierto} id="homeFocusEditor">
          <input type="hidden" name="sesion" value={sesion} />
          <h3>Encuadre de la portada</h3>
          <p className="club-muted">
            Mueve la imagen dentro del panel lateral. La foto conserva sus proporciones; los bordes
            que no quepan se recortan.
          </p>

          <label className="club-label" htmlFor="homeFocusX">
            IZQUIERDA ↔ DERECHA
          </label>
          <input defaultValue={x} id="homeFocusX" max={100} min={0} name="x" type="range" />

          <label className="club-label" htmlFor="homeFocusY">
            ARRIBA ↔ ABAJO
          </label>
          <input defaultValue={y} id="homeFocusY" max={100} min={0} name="y" type="range" />

          <div className="club-actions">
            <button
              className="club-button"
              data-admin-only="control"
              disabled={pendiente}
              id="homeFocusSave"
              type="submit"
            >
              Guardar encuadre
            </button>
            <button
              className="club-back"
              data-admin-only="control"
              id="homeFocusCancel"
              type="button"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </button>
          </div>

          <p id="homeFocusMessage" role="status">
            {estado.error ?? estado.exito}
          </p>
      </form>
    </div>
  );
}
