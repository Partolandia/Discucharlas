"use client";

import { useRouter } from "next/navigation";
import { IMAGENES } from "@/lib/prototipo";
import { BotonCorazon } from "@/components/comunidad/BotonCorazon";

export type HiloComunidad = {
  id: string;
  iniciales: string;
  cuando: string;
  titulo: string;
  autor: string;
  cuerpo: string;
  respuestas: number;
  corazones: number;
  /** Ya le di corazón a esta conversación. */
  miCorazon: boolean;
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
        id="openCommunityComposer"
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
            <article key={h.id} className="community-post-card social-feed-card">
              <span className="community-avatar">{h.iniciales}</span>
              <div className="community-post-main">
                <small>
                  {h.autor} · {h.cuando}
                </small>
                <button
                  type="button"
                  className="social-thread-link"
                  onClick={() => router.push(`/comunidad/${h.id}`)}
                >
                  <h3>{h.titulo}</h3>
                  <p>{h.cuerpo}</p>
                </button>
                <div className="social-card-footer">
                  <button
                    type="button"
                    className="social-replies"
                    onClick={() => router.push(`/comunidad/${h.id}`)}
                  >
                    {h.respuestas} {h.respuestas === 1 ? "respuesta" : "respuestas"}
                  </button>
                  <BotonCorazon hilo={h.id} cuenta={h.corazones} mio={h.miCorazon} />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
