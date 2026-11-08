"use client";

import { useRouter } from "next/navigation";
import { IMAGENES } from "@/lib/prototipo";

export type HiloComunidad = {
  id: string;
  iniciales: string;
  cuando: string;
  titulo: string;
  autor: string;
  cuerpo: string;
  respuestas: number;
  corazones: number;
};

/**
 * Pantalla Comunidad del prototipo v2.
 *
 * El prototipo pinta además una etiqueta por hilo (PREGUNTA, RECURSO). No la
 * reproducimos porque `community_threads` no guarda ese dato: habría que
 * inventarlo. Queda señalado para decidir si se añade al modelo.
 */
export function PantallaComunidad({ hilos }: { hilos: HiloComunidad[] }) {
  const router = useRouter();

  return (
    <section className="page active" id="comunidad">
      <header className="community-art-head">
        <div className="community-art-copy">
          <div className="eyebrow">ENTRE NOSOTROS</div>
          <h1>Comunidad</h1>
          <p>Ideas, preguntas y hallazgos que seguimos compartiendo.</p>
        </div>
        <div className="community-art-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Dos amigas conversando y compartiendo ideas" src={IMAGENES.comunidad} />
        </div>
      </header>

      <button
        className="community-create community-create-compact"
        type="button"
        onClick={() => router.push("/comunidad/nueva")}
      >
        <span aria-hidden="true" className="community-create-plus">
          ＋
        </span>
        <b>Abrir una conversación</b>
      </button>

      <div className="community-subhead">
        <span>CONVERSACIONES RECIENTES</span>
        <small id="communityCount">
          {hilos.length} {hilos.length === 1 ? "conversación" : "conversaciones"}
        </small>
      </div>

      <div id="communityFeed">
        {hilos.length === 0 ? (
          <div className="club-panel club-muted">
            Todavía no hay conversación. Puedes empezarla tú.
          </div>
        ) : (
          hilos.map((h) => (
            <button
              key={h.id}
              type="button"
              className="community-post-card"
              onClick={() => router.push(`/comunidad/${h.id}`)}
            >
              <span className="community-avatar">{h.iniciales}</span>
              <span className="community-post-main">
                <span className="community-post-meta">
                  <span className="community-post-time">{h.cuando}</span>
                </span>
                <h3>{h.titulo}</h3>
                <small className="community-opened-by">Abierta por {h.autor}</small>
                <p>{h.cuerpo}</p>
                <span className="community-post-footer">
                  <span>
                    {h.respuestas} {h.respuestas === 1 ? "respuesta" : "respuestas"}
                  </span>
                  <span>
                    {h.corazones} {h.corazones === 1 ? "corazón" : "corazones"}
                  </span>
                </span>
              </span>
              <span className="community-card-heart" aria-hidden="true" />
            </button>
          ))
        )}
      </div>
    </section>
  );
}
