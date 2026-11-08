"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { IMAGENES } from "@/lib/prototipo";

export type HiloResumen = {
  id: string;
  titulo: string;
  cuerpo: string;
  iniciales: string;
  pie: string;
};

export type DatosInicio = {
  sesion: {
    id: string;
    titulo: string;
    meta: string[];
    enlace: string | null;
    portada: string | null;
  } | null;
  realizadas: number;
  propuestas: number | null;
  votacionAbierta: boolean;
  hilos: HiloResumen[];
};

/**
 * Pantalla Inicio del prototipo v2, con su marcado original.
 *
 * El hero sin sesión reproduce el estado "SIN PRÓXIMA DEFINIDA" que el
 * prototipo monta desde JS, no el marcado estático de ejemplo.
 */
export function PantallaInicio({ sesion, realizadas, propuestas, votacionAbierta, hilos }: DatosInicio) {
  const router = useRouter();

  const estadoVoto = propuestas === null ? "loading" : votacionAbierta ? "active" : "inactive";
  const textoVoto =
    propuestas === null
      ? "Consultando votación…"
      : votacionAbierta
        ? "Hay una votación activa"
        : "No hay votación activa";

  return (
    <section className="page active" id="inicio">
      <article
        className={sesion?.portada ? "hero custom-cover" : "hero"}
        style={
          sesion?.portada
            ? ({ "--hero-cover": `url("${sesion.portada}")` } as CSSProperties)
            : undefined
        }
      >
        <div className="hero-content">
          <span className="label">{sesion ? "PRÓXIMA DISCUCHARLA" : "SIN PRÓXIMA DEFINIDA"}</span>
          <h1>{sesion ? sesion.titulo : "Por el momento no hay una próxima Discucharla definida"}</h1>
          <div className="scribble" />
          <div className="meta">
            {sesion ? (
              sesion.meta.map((linea, i) => (
                <span key={linea}>
                  {i > 0 && <br />}
                  {linea}
                </span>
              ))
            ) : (
              <>Cuando se confirme una nueva sesión, aparecerá aquí.</>
            )}
          </div>
        </div>
        <div className="hero-actions">
          <button
            className="cta primary"
            style={sesion?.enlace ? undefined : { display: "none" }}
            onClick={() => sesion?.enlace && window.open(sesion.enlace, "_blank", "noopener")}
          >
            <svg aria-hidden="true" className="spotify-mark" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" />
              <path
                d="M6.8 9.4c3.6-1.1 7.8-.8 10.9.8M7.6 12.5c3-.8 6.8-.5 9.4.8M8.3 15.4c2.5-.6 5.5-.3 7.7.7"
                fill="none"
                stroke="#24152e"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            Escuchar episodio　→
          </button>
          <button
            className="cta"
            style={sesion ? undefined : { display: "none" }}
            onClick={() => sesion && router.push(`/discucharla/${sesion.id}`)}
          >
            Ver detalle　→
          </button>
        </div>
      </article>

      <div aria-label="Resumen del club" className="archive-memory-strip" id="archiveMemoryStrip">
        <article
          className="archive-memory-card is-clickable"
          role="button"
          tabIndex={0}
          onClick={() => router.push("/nuestras-discucharlas")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/nuestras-discucharlas");
            }
          }}
        >
          <small>HISTORIAL</small>
          <h4
            id="archiveRealizedCount"
            aria-label={`${realizadas} ${realizadas === 1 ? "Discucharla realizada" : "Discucharlas realizadas"}`}
          >
            <span className="home-stat-number">{realizadas}</span>
            <span className="home-stat-copy">
              {realizadas === 1 ? "Discucharla realizada" : "Discucharlas realizadas"}
            </span>
          </h4>
        </article>

        <article
          className="archive-memory-card is-clickable"
          role="button"
          tabIndex={0}
          onClick={() => router.push("/propuestas")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/propuestas");
            }
          }}
        >
          <small>PROPUESTAS</small>
          <h4
            id="archiveActiveProposalCount"
            aria-label={
              propuestas === null
                ? "Cargando propuestas"
                : `Actualmente hay ${propuestas} ${propuestas === 1 ? "propuesta" : "propuestas"} de podcast`
            }
          >
            {propuestas === null ? (
              <span className="home-stat-loading">Cargando…</span>
            ) : (
              <>
                <span className="home-stat-number">{propuestas}</span>
                <span className="home-stat-copy">
                  {propuestas === 1 ? "propuesta" : "propuestas"} de podcast
                </span>
              </>
            )}
          </h4>
          <p id="homeVotingState" data-vote-state={estadoVoto}>
            <span className="home-vote-dot" aria-hidden="true" />
            <span>{textoVoto}</span>
          </p>
        </article>
      </div>

      <button className="feature" onClick={() => router.push("/nuestras-discucharlas")}>
        <span className="feature-copy">
          <h2>Historial de Discucharlas</h2>
          <span>Explorar sesiones anteriores</span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Recuerdos del club" src={IMAGENES.historial} />
      </button>

      <button className="feature" onClick={() => router.push("/guia")}>
        <span className="feature-copy">
          <h2>Guía del club</h2>
          <span>Conocer cómo funciona</span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Libro abierto" src={IMAGENES.guia} />
      </button>

      <section className="community-preview">
        <span className="eyebrow">LA COMUNIDAD HOY</span>
        <div className="section-head">
          <h2>Conversaciones recientes</h2>
          <button className="link" onClick={() => router.push("/comunidad")}>
            Ver todas
          </button>
        </div>
        {hilos.map((hilo) => (
          <article
            key={hilo.id}
            className="post"
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/comunidad/${hilo.id}`)}
          >
            <span className="avatar">{hilo.iniciales}</span>
            <div>
              <b>{hilo.titulo}</b>
              <p>{hilo.cuerpo}</p>
              <small>{hilo.pie}</small>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
