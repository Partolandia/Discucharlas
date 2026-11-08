"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Backline } from "@/components/prototipo/Backline";

export type FichaArchivo = {
  id: string;
  titulo: string;
  meta: string;
  estado: "draft" | "upcoming" | "past" | "cancelled";
  portada: string | null;
};

const ETIQUETA = {
  draft: "BORRADOR",
  upcoming: "PRÓXIMA",
  past: "REALIZADA",
  cancelled: "CANCELADA",
} as const;

const FILTROS = [
  { id: "all", texto: "Todas" },
  { id: "upcoming", texto: "Próximas" },
  { id: "past", texto: "Realizadas" },
  { id: "cancelled", texto: "Canceladas" },
] as const;

/** Pantalla "Historial de Discucharlas" del prototipo v2. */
export function PantallaArchivo({ fichas }: { fichas: FichaArchivo[] }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<string>("all");

  const visibles = fichas.filter((f) => filtro === "all" || f.estado === filtro);

  return (
    <section className="page archive-editorial-page active" id="archivo">
      <Backline a="/inicio" texto="Volver a Inicio" clase="backline-home" />

      <header className="archive-editorial-head">
        <div className="archive-head-copy">
          <div className="eyebrow">NUESTRA HISTORIA</div>
          <h1>Historial de Discucharlas</h1>
          <p>Los episodios, conversaciones y encuentros que ya forman parte del club.</p>
        </div>
        <div aria-hidden="true" className="archive-head-mark">
          D
        </div>
      </header>

      <div className="archive-tabs archive-tabs-editorial" id="archiveTabs">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={filtro === f.id ? "active" : undefined}
            data-filter={f.id}
            onClick={() => setFiltro(f.id)}
          >
            {f.texto}
          </button>
        ))}
      </div>

      <div className="archive-list-editorial" id="archiveList">
        {visibles.map((f) => (
          <article
            key={f.id}
            className={`archive-item archive-item-editorial${f.estado === "upcoming" ? " archive-featured" : ""}`}
            data-status={f.estado}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/discucharla/${f.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/discucharla/${f.id}`);
              }
            }}
          >
            {f.portada ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="archive-cover archive-cover-art" src={f.portada} alt={`Portada de ${f.titulo}`} />
            ) : (
              <span className="archive-cover archive-cover-initial cover-upcoming">d</span>
            )}
            <div className="archive-item-copy">
              <span className="status">{ETIQUETA[f.estado]}</span>
              <h3>{f.titulo}</h3>
              <p>{f.meta}</p>
            </div>
            <b className="archive-arrow">›</b>
          </article>
        ))}
      </div>

      {visibles.length === 0 && (
        <div className="prototype-empty-state" style={{ display: "block" }}>
          <span className="empty-mark">◦</span>
          <b>Todavía no hay Discucharlas guardadas</b>
          <p>Cuando se cree o cierre una sesión, podrás encontrarla aquí.</p>
        </div>
      )}
    </section>
  );
}
