"use client";

import { useRouter } from "next/navigation";

export type PropuestaFila = {
  id: string;
  titulo: string;
  podcast: string | null;
  duracion: string | null;
  resena: string | null;
  autor: string;
  enlace: string | null;
  suspendida: boolean;
};

/** Pantalla "Propuestas" (banco de podcasts) del prototipo v2. */
export function PantallaPropuestasLista({ propuestas }: { propuestas: PropuestaFila[] }) {
  const router = useRouter();

  return (
    <section id="club-proposals" className="page active">
      <button className="club-back" onClick={() => router.push("/propuestas")}>
        ‹ Volver a propuestas y votaciones
      </button>

      <header className="club-proposals-header">
        <span className="club-kicker">IDEAS PARA COMPARTIR</span>
        <h1>Propuestas</h1>
        <p>Explora los podcasts propuestos por el club o agrega uno nuevo.</p>
      </header>

      <div className="club-list-heading">
        <h2 id="clubProposalCount">
          {propuestas.length} {propuestas.length === 1 ? "propuesta" : "propuestas"}
        </h2>
        <button className="club-button" onClick={() => router.push("/propuestas/nueva")}>
          ＋ Proponer un podcast
        </button>
      </div>

      <div id="clubProposalList">
        {propuestas.length === 0 ? (
          <div className="club-panel club-muted">
            Todavía no hay propuestas. Puedes agregar la primera.
          </div>
        ) : (
          propuestas.map((p) => (
            <article key={p.id} className={`club-proposal${p.suspendida ? " is-suspended" : ""}`}>
              <div className="club-kicker">{p.suspendida ? "SUSPENDIDA" : "PROPUESTA"}</div>
              {p.suspendida && (
                <p className="club-suspended-note">
                  Esta propuesta está suspendida y no participa en nuevas votaciones.
                </p>
              )}
              <h3>{p.titulo}</h3>
              <p className="club-muted">{[p.podcast, p.duracion].filter(Boolean).join(" · ")}</p>
              <p>{p.resena}</p>
              <small>Propuesto por {p.autor}</small>
              {p.enlace && (
                <p>
                  <a href={p.enlace} target="_blank" rel="noopener noreferrer">
                    Escuchar episodio ↗
                  </a>
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
