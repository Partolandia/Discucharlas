"use client";

import { useRouter } from "next/navigation";

/**
 * Pantalla "Propuestas y votaciones" (`#votacion`) del prototipo v2.
 *
 * Es el concentrador: resume el banco de propuestas y luego muestra la
 * votación completa en línea —boleta, resultado y herramientas de
 * administración—, que llega como `children` desde el servidor.
 */
export function PantallaPropuestas({
  propuestas,
  children,
}: {
  propuestas: number;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <section className="page proposals-page active" id="votacion">
      <header className="club-proposals-header">
        <span className="club-kicker">LA PRÓXIMA CONVERSACIÓN</span>
        <h1>Propuestas</h1>
        <p>Propón podcasts, participa en las votaciones y consulta los resultados.</p>
      </header>

      <section className="club-panel club-proposals-summary">
        <h2 className="club-section-title">1. PROPUESTAS</h2>
        <p id="clubProposalSummary">
          Actualmente hay {propuestas} {propuestas === 1 ? "propuesta activa" : "propuestas activas"}
        </p>
        <button
          className="club-button"
          id="clubViewProposals"
          onClick={() => router.push("/propuestas/lista")}
        >
          Ver propuestas →
        </button>
      </section>

      <h2 className="club-section-title">2. VOTACIONES</h2>

      {children}

      <button
        className="club-history-link"
        id="clubOpenHistory"
        onClick={() => router.push("/propuestas/historial")}
      >
        Historial de votaciones <span>→</span>
      </button>
    </section>
  );
}
