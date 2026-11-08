"use client";

import { Backline } from "@/components/prototipo/Backline";

export type Aviso = {
  id: string;
  titulo: string;
  detalle: string;
  icono: string;
  alt: string;
  leido: boolean;
};

/** Pantalla Notificaciones del prototipo v2. */
export function PantallaAvisos({
  avisos,
  marcarLeidos,
}: {
  avisos: Aviso[];
  marcarLeidos: () => Promise<void>;
}) {
  const sinLeer = avisos.filter((a) => !a.leido).length;

  return (
    <section className="page active" id="notificaciones">
      <Backline a="/inicio" texto="Volver a Inicio" />

      <header className="account-section-hero notifications-section-hero">
        <div className="account-section-copy">
          <div className="eyebrow">AL DÍA</div>
          <h1 className="page-title">Notificaciones</h1>
          <p>Novedades, recordatorios y avisos del Club.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="account-section-art"
          alt="Collage editorial de notificaciones"
          src="/prototipo/21-16c16a30.webp"
        />
      </header>

      {avisos.length === 0 ? (
        <div className="prototype-empty-state" style={{ display: "block" }}>
          <span className="empty-mark">◦</span>
          <b>No hay avisos todavía</b>
          <p>Aquí te llegan cuando se agende una Discucharla o se abra una votación.</p>
        </div>
      ) : (
        avisos.map((a) => (
          <article key={a.id} className={`notice ${a.leido ? "notice-read" : "notice-new"}`}>
            <span className="notice-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={a.alt} src={a.icono} />
            </span>
            <div className="notice-copy">
              <b>{a.titulo}</b>
              <small>{a.detalle}</small>
            </div>
            <span className="notice-dot" aria-hidden="true" />
          </article>
        ))
      )}

      {sinLeer > 0 && (
        <form action={marcarLeidos}>
          <button className="club-back" type="submit">
            Marcar como leídos
          </button>
        </form>
      )}
    </section>
  );
}
