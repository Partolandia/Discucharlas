"use client";

import { useRouter } from "next/navigation";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { cambiarEstadoPropuesta, retirarPropuesta } from "@/app/(integrante)/propuestas/acciones";

export type PropuestaFila = {
  id: string;
  titulo: string;
  podcast: string | null;
  duracion: string | null;
  resena: string | null;
  autor: string;
  enlace: string | null;
  portada: string | null;
  estado: "active" | "suspended" | "used" | "deleted";
  /** La propuso quien está mirando la pantalla. */
  propia: boolean;
};

const KICKER: Record<PropuestaFila["estado"], string> = {
  active: "PROPUESTA",
  suspended: "SUSPENDIDA",
  used: "ARCHIVADA",
  deleted: "ARCHIVADA",
};

/** A partir de aquí la reseña se recorta y se ofrece desplegada. */
const LARGA = 180;

/** Pantalla "Propuestas" (banco de podcasts) del prototipo v2. */
export function PantallaPropuestasLista({
  propuestas,
  esAdmin,
}: {
  propuestas: PropuestaFila[];
  esAdmin: boolean;
}) {
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
        <button
          className="club-button"
          id="clubNewProposal"
          onClick={() => router.push("/propuestas/nueva")}
        >
          ＋ Proponer un podcast
        </button>
      </div>

      <div id="clubProposalList">
        {propuestas.length === 0 ? (
          <div className="club-panel club-muted">
            Todavía no hay propuestas. Puedes agregar la primera.
          </div>
        ) : (
          propuestas.map((p) => <Tarjeta key={p.id} p={p} esAdmin={esAdmin} router={router} />)
        )}
      </div>
    </section>
  );
}

function Tarjeta({
  p,
  esAdmin,
  router,
}: {
  p: PropuestaFila;
  esAdmin: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const activa = p.estado === "active";
  const editable = esAdmin || (p.propia && activa);
  const puedeRetirar = activa && (esAdmin || p.propia);

  return (
    <article
      className={`club-proposal compact-proposal${p.estado === "suspended" ? " is-suspended" : ""}`}
    >
      <div className="proposal-card-main">
        {p.portada && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="proposal-card-thumb" src={p.portada} alt="Portada de la propuesta" />
        )}
        <div className="proposal-card-copy">
          <div className="club-kicker">{KICKER[p.estado]}</div>
          <h3>{p.titulo}</h3>
          {(p.podcast || p.duracion) && (
            <p className="proposal-card-meta">
              {[p.podcast, p.duracion].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {p.estado === "suspended" && (
        <p className="club-suspended-note">Suspendida: no participa en nuevas votaciones.</p>
      )}

      <Resena texto={p.resena} />

      <div className="proposal-card-footer">
        <small>Propuesto por {p.autor}</small>
        {p.enlace && (
          <a href={p.enlace} target="_blank" rel="noopener noreferrer">
            Escuchar ↗
          </a>
        )}
      </div>

      <div className="club-actions">
        {editable && (
          <button type="button" onClick={() => router.push(`/propuestas/${p.id}/editar`)}>
            Editar
          </button>
        )}
        {esAdmin && (
          <BotonAccion
            accion={cambiarEstadoPropuesta}
            campos={{ propuesta: p.id, estado: activa ? "suspended" : "active" }}
          >
            {activa ? "Suspender" : "Reactivar"}
          </BotonAccion>
        )}
        {puedeRetirar && (
          <BotonAccion
            accion={retirarPropuesta}
            campos={{ propuesta: p.id }}
            tono="delicado"
            confirmacion="La propuesta sale del banco. Los votos que ya recibió se conservan."
          >
            Retirar
          </BotonAccion>
        )}
      </div>
    </article>
  );
}

/**
 * El prototipo corta las reseñas largas en el último espacio antes del
 * carácter 135 y ofrece el texto completo en un desplegable.
 */
function Resena({ texto }: { texto: string | null }) {
  const resena = texto ?? "";
  if (!resena) return null;

  if (resena.length <= LARGA) return <p className="proposal-review-text">{resena}</p>;

  return (
    <>
      <p className="proposal-review-preview">{resena.slice(0, 135).replace(/\s+\S*$/, "")}…</p>
      <details className="proposal-review-full">
        <summary>Leer reseña completa</summary>
        <p>{resena}</p>
      </details>
    </>
  );
}
