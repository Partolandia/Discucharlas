"use client";

import { useActionState } from "react";
import {
  alternarAporte,
  guardarDetalleOtro,
  type Resultado,
} from "@/app/(integrante)/discucharla/acciones";
import { CATEGORIAS_APORTE } from "@/lib/dominio";

/** Categorías con cuadrícula propia; "otro" vive en el campo de detalle. */
const CUADRICULA = CATEGORIAS_APORTE.filter((c) => c.valor !== "otro");

export function Aportes({
  sesion,
  misCategorias,
  detalleOtro,
  quienes,
  otros,
}: {
  sesion: string;
  misCategorias: string[];
  detalleOtro: string | null;
  quienes: Record<string, string[]>;
  otros: Array<{ nombre: string; detalle: string }>;
}) {
  const [estado, alternar, pendiente] = useActionState<Resultado, FormData>(alternarAporte, {});
  const [estadoOtro, guardarOtro] = useActionState<Resultado, FormData>(guardarDetalleOtro, {});

  return (
    <section className="content-card planning-section session-card session-card-bring">
      <div className="club-kicker">LA MESA</div>
      <h3>¿Qué llevas?</h3>
      <p className="club-muted">Puedes elegir varias categorías.</p>

      <form action={alternar}>
        <input type="hidden" name="sesion" value={sesion} />
        <fieldset className="club-bring-grid" disabled={pendiente}>
          <legend className="sr-only">Categorías</legend>
          {CUADRICULA.map((c) => {
            const elegida = misCategorias.includes(c.valor);
            const lista = quienes[c.valor] ?? [];
            return (
              <button
                key={c.valor}
                type="submit"
                name="categoria"
                value={c.valor}
                aria-pressed={elegida}
                className={`poll-choice${elegida ? " on" : ""}`}
              >
                <strong>{c.texto}</strong>
                <b className="poll-count">
                  {lista.length} {lista.length === 1 ? "voto" : "votos"}
                </b>
                <small className="voters">{lista.length ? lista.join(", ") : "Nadie todavía"}</small>
              </button>
            );
          })}
        </fieldset>
        {estado.error && (
          <p className="club-message" role="status">
            {estado.error}
          </p>
        )}
      </form>

      <form action={guardarOtro}>
        <input type="hidden" name="sesion" value={sesion} />
        <label className="club-label" htmlFor="detalle">
          OTRO / DETALLE OPCIONAL
        </label>
        <input
          className="form-input"
          id="detalle"
          name="detalle"
          defaultValue={detalleOtro ?? ""}
          maxLength={500}
          placeholder="Por ejemplo: hielo y vasos"
        />
        <div aria-live="polite">
          {otros.length === 0 ? (
            <p className="club-muted">Todavía no hay otras aportaciones.</p>
          ) : (
            otros.map((o) => (
              <p key={`${o.nombre}-${o.detalle}`} className="club-muted">
                {o.nombre}: {o.detalle}
              </p>
            ))
          )}
        </div>
        <button className="club-button" type="submit">
          Guardar detalle
        </button>
        <p className="club-message" role="status" aria-live="polite">
          {estadoOtro.error ?? estadoOtro.exito}
        </p>
      </form>
    </section>
  );
}
