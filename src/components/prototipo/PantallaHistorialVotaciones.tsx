"use client";

import { useRouter } from "next/navigation";

export type RondaCerrada = {
  id: string;
  titulo: string;
  cerrada: string;
  ganador: string;
};

/** Pantalla "Historial de votaciones" del prototipo v2. */
export function PantallaHistorialVotaciones({ rondas }: { rondas: RondaCerrada[] }) {
  const router = useRouter();

  return (
    <section id="club-history" className="page active">
      <button className="club-back" onClick={() => router.push("/propuestas")}>
        ‹ Volver a propuestas
      </button>

      <div className="club-head">
        <h1>Historial de votaciones</h1>
        <p>Consulta las votaciones cerradas y el episodio elegido.</p>
      </div>

      <div id="clubHistoryList">
        {rondas.length === 0 ? (
          <div className="club-panel">Todavía no hay votaciones cerradas.</div>
        ) : (
          rondas.map((r) => (
            <article key={r.id} className="club-panel">
              <span className="club-kicker">VOTACIÓN CERRADA · {r.cerrada}</span>
              <h2>{r.titulo}</h2>
              <p>
                <b>Episodio elegido:</b> {r.ganador}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
