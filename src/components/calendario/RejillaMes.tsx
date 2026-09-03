import Link from "next/link";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";

export type SesionEnRejilla = {
  id: string;
  date: string | null;
  status: string;
  episode_title: string;
};

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

function nombreDelMes(mes: string) {
  const [anio, m] = mes.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(anio, m - 1, 1))
  );
}

/** Celdas de la rejilla, empezando en lunes. null = hueco antes del día 1. */
function celdasDelMes(mes: string) {
  const [anio, m] = mes.split("-").map(Number);
  const primero = new Date(Date.UTC(anio, m - 1, 1));
  const diasEnMes = new Date(Date.UTC(anio, m, 0)).getUTCDate();
  // getUTCDay() da 0 en domingo; lo rotamos para que la semana abra en lunes.
  const hueco = (primero.getUTCDay() + 6) % 7;

  return [
    ...Array.from({ length: hueco }, () => null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
}

export function RejillaMes({
  mes,
  sesiones,
  hrefMes,
}: {
  mes: string;
  sesiones: SesionEnRejilla[];
  hrefMes: (mes: string) => string;
}) {
  const [anio, m] = mes.split("-").map(Number);
  const anterior = new Date(Date.UTC(anio, m - 2, 1)).toISOString().slice(0, 7);
  const siguiente = new Date(Date.UTC(anio, m, 1)).toISOString().slice(0, 7);

  const porDia = new Map<number, SesionEnRejilla[]>();
  for (const s of sesiones) {
    if (!s.date) continue;
    const dia = Number(s.date.slice(8, 10));
    porDia.set(dia, [...(porDia.get(dia) ?? []), s]);
  }

  const estadosPresentes = new Set(sesiones.map((s) => s.status));

  return (
    <section
      className="mt-4 rounded-[var(--radius-tarjeta)] px-4 py-5 text-white"
      style={{ background: "var(--color-tinta)" }}
    >
      <nav className="flex items-center justify-between px-1" aria-label="Navegación por mes">
        <Link
          href={hrefMes(anterior)}
          aria-label="Mes anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-[16px]"
        >
          ‹
        </Link>
        <div className="text-center">
          <h2 className="editorial text-[1.4rem] leading-none capitalize">{nombreDelMes(mes)}</h2>
          <p className="mt-1 text-[11px] tracking-[0.18em] text-white/50">{anio}</p>
        </div>
        <Link
          href={hrefMes(siguiente)}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-[16px]"
        >
          ›
        </Link>
      </nav>

      <div className="mt-5 grid grid-cols-7 gap-y-1 text-center">
        {DIAS.map((d, i) => (
          <span key={i} className="pb-1 text-[11px] font-medium text-white/40">
            {d}
          </span>
        ))}

        {celdasDelMes(mes).map((dia, i) => {
          if (dia === null) return <span key={`hueco-${i}`} />;
          const delDia = porDia.get(dia) ?? [];

          const contenido = (
            <>
              <span
                className={`text-[14px] tabular-nums ${
                  delDia.length ? "font-semibold text-white" : "text-white/55"
                }`}
              >
                {dia}
              </span>
              <span className="mt-1 flex h-1.5 items-center justify-center gap-0.5">
                {delDia.slice(0, 3).map((s) => (
                  <span
                    key={s.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: ESTADOS_SESION[s.status as EstadoSesion].color }}
                  />
                ))}
              </span>
            </>
          );

          return (
            <span key={dia} className="flex flex-col items-center py-1.5">
              {delDia.length === 1 ? (
                <Link
                  href={`/discucharla/${delDia[0].id}`}
                  className="flex flex-col items-center"
                  aria-label={`${dia}: ${delDia[0].episode_title}`}
                >
                  {contenido}
                </Link>
              ) : (
                contenido
              )}
            </span>
          );
        })}
      </div>

      {estadosPresentes.size > 0 && (
        <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/15 pt-4">
          {(Object.keys(ESTADOS_SESION) as EstadoSesion[])
            .filter((e) => estadosPresentes.has(e))
            .map((e) => (
              <li key={e} className="flex items-center gap-1.5 text-[11px] text-white/65">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: ESTADOS_SESION[e].color }}
                />
                {ESTADOS_SESION[e].texto}
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
