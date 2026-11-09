"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IMAGENES } from "@/lib/prototipo";

export type SesionCalendario = {
  id: string;
  titulo: string;
  /** AAAA-MM-DD */
  fecha: string;
  hora: string | null;
  lugar: string | null;
  estado: "draft" | "upcoming" | "past" | "cancelled";
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MESES_CORTO = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];
const COPIA_ESTADO = {
  upcoming: "Próxima",
  past: "Realizada",
  cancelled: "Cancelada",
  draft: "Borrador",
} as const;

/** Prioridad del punto cuando un día tiene varias, igual que el prototipo. */
function estadoDelDia(sesiones: SesionCalendario[]) {
  if (sesiones.some((s) => s.estado === "upcoming")) return "upcoming";
  if (sesiones.some((s) => s.estado === "draft")) return "draft";
  if (sesiones.some((s) => s.estado === "cancelled")) return "cancelled";
  return sesiones.length ? "past" : "";
}

export function PantallaCalendario({
  sesiones,
  esAdmin,
  mesInicial,
}: {
  sesiones: SesionCalendario[];
  esAdmin: boolean;
  /** AAAA-MM con el que abre la pantalla. */
  mesInicial: string;
}) {
  const router = useRouter();
  const [anio, setAnio] = useState(() => Number(mesInicial.slice(0, 4)));
  const [mes, setMes] = useState(() => Number(mesInicial.slice(5, 7)) - 1);
  const [diaElegido, setDiaElegido] = useState<number | null>(null);

  const delMes = useMemo(
    () =>
      sesiones
        .filter((s) => {
          const [a, m] = s.fecha.split("-").map(Number);
          return a === anio && m === mes + 1;
        })
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [sesiones, anio, mes],
  );

  const porDia = useMemo(() => {
    const mapa = new Map<number, SesionCalendario[]>();
    for (const s of delMes) {
      const d = Number(s.fecha.slice(8, 10));
      mapa.set(d, [...(mapa.get(d) ?? []), s]);
    }
    return mapa;
  }, [delMes]);

  function mover(delta: number) {
    const fecha = new Date(anio, mes + delta, 1);
    setAnio(fecha.getFullYear());
    setMes(fecha.getMonth());
    setDiaElegido(null);
  }

  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  // La semana del prototipo empieza en lunes.
  const hueco = (new Date(anio, mes, 1).getDay() + 6) % 7;

  const celdas: React.ReactNode[] = [];
  for (let i = 0; i < hueco; i++) {
    celdas.push(<span key={`antes-${i}`} className="cal-day is-muted" />);
  }
  for (let d = 1; d <= diasDelMes; d++) {
    const delDia = porDia.get(d) ?? [];
    const estado = estadoDelDia(delDia);
    const clases = [
      "cal-day",
      delDia.length ? "has-session" : "",
      estado ? `state-${estado}` : "",
      diaElegido === d ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    celdas.push(
      <span
        key={d}
        className={clases}
        {...(delDia.length
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": `${d}, ${delDia.length} Discucharla${delDia.length === 1 ? "" : "s"}`,
              onClick: () => setDiaElegido(diaElegido === d ? null : d),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDiaElegido(diaElegido === d ? null : d);
                }
              },
            }
          : {})}
      >
        {d}
      </span>,
    );
  }
  while (celdas.length % 7) {
    celdas.push(<span key={`despues-${celdas.length}`} className="cal-day is-muted" />);
  }

  const visibles = diaElegido
    ? delMes.filter((s) => Number(s.fecha.slice(8, 10)) === diaElegido)
    : delMes;

  return (
    <section className="page active" id="calendario">
      <header className="calendar-art-head">
        <div className="calendar-art-copy">
          <div className="eyebrow">PRÓXIMOS ENCUENTROS</div>
          <h1>Calendario del club</h1>
          <p>Consulta las fechas del club y entra al detalle de cada Discucharla.</p>
        </div>
        <div className="calendar-art-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Retrato editorial para Calendario" src={IMAGENES.calendario} />
        </div>
      </header>

      <div className="calendar calendar-editorial">
        <div className="month calendar-month">
          <button aria-label="Mes anterior" id="calendarPrev" type="button" onClick={() => mover(-1)}>
            ‹
          </button>
          <div>
            <b id="calendarMonthLabel">{MESES[mes]}</b>
            <span id="calendarYearLabel">{anio}</span>
          </div>
          <button aria-label="Mes siguiente" id="calendarNext" type="button" onClick={() => mover(1)}>
            ›
          </button>
        </div>

        <div className="week">
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </div>

        <div className="days" id="days">
          {celdas}
        </div>

        <div className="calendar-legend" aria-label="Estados del calendario">
          <span>
            <i className="cal-dot cal-dot-upcoming" />
            Próxima
          </span>
          <span>
            <i className="cal-dot cal-dot-past" />
            Realizada
          </span>
          <span>
            <i className="cal-dot cal-dot-cancelled" />
            Cancelada
          </span>
          {esAdmin && (
            <span
              className="admin-only-field"
              id="calendarDraftLegend"
              style={{ display: "inline-flex" }}
            >
              <i className="cal-dot cal-dot-draft" />
              Borrador
            </span>
          )}
        </div>
      </div>

      <div className="calendar-next-label">
        <span />
        DISCUCHARLAS DEL MES
      </div>

      <div className="calendar-session-list" id="calendarSessionList">
        {visibles.length === 0 ? (
          <div className="calendar-month-empty">
            {diaElegido
              ? "No hay Discucharlas registradas para este día."
              : "No hay Discucharlas registradas en este mes."}
          </div>
        ) : (
          visibles.map((s) => (
            <button
              key={s.id}
              type="button"
              className="calendar-session-card-v133"
              onClick={() => router.push(`/discucharla/${s.id}`)}
            >
              <div className="calendar-date-badge">
                <strong>{Number(s.fecha.slice(8, 10))}</strong>
                <span>{MESES_CORTO[Number(s.fecha.slice(5, 7)) - 1]}</span>
              </div>
              <div className="calendar-session-copy">
                <small>
                  {`${s.hora ? `${s.hora} · ` : ""}${COPIA_ESTADO[s.estado]}`.toUpperCase()}
                </small>
                <h3>{s.titulo}</h3>
                <p>{s.lugar || "Lugar sin registrar"}</p>
              </div>
              <span className={`calendar-session-status ${s.estado}`}>{COPIA_ESTADO[s.estado]}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
