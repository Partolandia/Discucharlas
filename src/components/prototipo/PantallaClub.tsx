"use client";

import { useRouter } from "next/navigation";
import { IMAGENES } from "@/lib/prototipo";

export type IntegranteFila = {
  id: string;
  nombre: string;
  iniciales: string;
  acento: string;
  epigrafe: string;
  detalle: string;
  esMio: boolean;
};

/** Pantalla Club (Integrantes) del prototipo v2. */
export function PantallaClub({
  integrantes,
  realizadas,
  rutaProponer,
}: {
  integrantes: IntegranteFila[];
  realizadas: number;
  rutaProponer?: string;
}) {
  const router = useRouter();

  return (
    <section className="page club-page-editorial active" id="club">
      <header className="club-photo-head club-integrated-head">
        <div className="club-photo-title club-integrated-copy">
          <div className="eyebrow">NUESTRO CÍRCULO</div>
          <h1>Integrantes</h1>
          <p>
            <span id="clubActiveMemberCount">
              {integrantes.length} {integrantes.length === 1 ? "integrante" : "integrantes"}
            </span>{" "}
            ·<br />
            <span id="clubRealizedCount">
              {realizadas} {realizadas === 1 ? "Discucharla realizada" : "Discucharlas realizadas"}
            </span>
          </p>
        </div>
        <div className="club-integrated-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Collage editorial de integrantes del club"
            className="club-photo-main"
            src={IMAGENES.club}
          />
        </div>
      </header>

      <div className="club-list-head">
        <span>QUIÉNES SOMOS</span>
        <b>Toca un perfil para conocerlo</b>
      </div>

      {rutaProponer && (
        <button
          className="club-propose-member"
          type="button"
          onClick={() => router.push(rutaProponer)}
        >
          <span aria-hidden="true">＋</span>
          <span>
            <b>Proponer nuevo integrante</b>
            <small>Invita a alguien de tu confianza a sumarse al Club</small>
          </span>
          <span aria-hidden="true" className="club-propose-arrow">
            ›
          </span>
        </button>
      )}

      <div id="members">
        {integrantes.map((i) => (
          <article
            key={i.id}
            className={`member club-member-row${i.esMio ? " club-member-own" : ""}`}
            data-member={i.nombre}
            style={{ ["--member-accent" as string]: i.acento, cursor: "pointer" }}
            onClick={() => router.push(i.esMio ? "/perfil" : `/club/${i.id}`)}
          >
            <span className="club-member-avatar" style={{ background: i.acento }}>
              {i.iniciales}
            </span>
            <div className="club-member-copy">
              <small>{i.epigrafe}</small>
              <b>{i.nombre}</b>
              <span>{i.detalle}</span>
            </div>
            <b className="club-member-arrow">›</b>
          </article>
        ))}
      </div>
    </section>
  );
}
