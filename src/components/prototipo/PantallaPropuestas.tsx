"use client";

import { useRouter } from "next/navigation";

export type EstadoVotacion = {
  titulo: string;
  abierta: boolean;
  candidaturas: number;
} | null;

/**
 * Pantalla "Propuestas y votaciones" del prototipo v2: el concentrador desde el
 * que se entra al banco de propuestas, a la votación y al historial.
 *
 * Los botones de administración del prototipo (crear, cerrar o modificar la
 * votación) no se repiten aquí: en la app esas acciones viven en /admin/votacion,
 * donde ya se validan contra la base.
 */
export function PantallaPropuestas({
  propuestas,
  votacion,
  esAdmin,
}: {
  propuestas: number;
  votacion: EstadoVotacion;
  esAdmin: boolean;
}) {
  const router = useRouter();
  const abierta = Boolean(votacion?.abierta);

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
        <button className="club-button" onClick={() => router.push("/propuestas/lista")}>
          Ver propuestas →
        </button>
      </section>

      <h2 className="club-section-title">2. VOTACIONES</h2>

      <article className="club-voting-hero">
        <span className="club-status">
          {votacion ? (abierta ? "VOTACIÓN ACTIVA" : "VOTACIÓN CERRADA") : "SIN VOTACIÓN"}
        </span>
        <h2>{votacion?.titulo || "Pronto elegiremos qué escuchar"}</h2>
        <p>
          {votacion
            ? abierta
              ? "La elección está abierta. Vota por los episodios que te gustaría escuchar."
              : "La elección terminó. Consulta los resultados y el episodio elegido."
            : "Mientras tanto, comparte episodios para la próxima selección."}
        </p>
        {votacion && (
          <button className="club-button" onClick={() => router.push("/propuestas/votar")}>
            {abierta ? "Ir a votar →" : "Ver resultados →"}
          </button>
        )}
        {esAdmin && (
          <div className="club-actions">
            <button
              className="club-button secondary"
              onClick={() => router.push("/admin/votacion")}
            >
              {abierta ? "Administrar votación" : "Crear nueva votación"}
            </button>
          </div>
        )}
      </article>

      {!votacion && (
        <p className="club-muted">
          Aún no hay una votación. Puedes explorar o agregar propuestas.
        </p>
      )}

      <button className="club-history-link" onClick={() => router.push("/propuestas/historial")}>
        Historial de votaciones <span>→</span>
      </button>
    </section>
  );
}
