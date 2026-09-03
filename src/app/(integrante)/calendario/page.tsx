import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { ZONA_HORARIA_CLUB } from "@/lib/entorno";
import { fechaCorta, rangoHorario } from "@/lib/fechas";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";

export const metadata = { title: "Calendario" };

/** "2026-09" del mes en curso, en la zona del club. */
function mesActual() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_CLUB,
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .slice(0, 7);
}

function desplazarMes(mes: string, delta: number) {
  const [anio, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(anio, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function nombreDelMes(mes: string) {
  const [anio, m] = mes.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(anio, m - 1, 1)));
}

export default async function Calendario({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes: mesPedido } = await searchParams;
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const mes = /^\d{4}-\d{2}$/.test(mesPedido ?? "") ? mesPedido! : mesActual();
  const desde = `${mes}-01`;
  const hasta = `${desplazarMes(mes, 1)}-01`;

  // RLS ya filtra los borradores para quien no administra; el conteo de más
  // abajo solo sirve para explicarlo en la interfaz.
  const { data: sesiones } = await supabase
    .from("sessions")
    .select("*")
    .gte("date", desde)
    .lt("date", hasta)
    .order("date");

  const admin = esAdministradora(perfil);

  return (
    <main className="px-6 pb-8">
      <header
        className="grano relative mt-4 overflow-hidden rounded-[var(--radius-tarjeta)] p-7 text-white"
        style={{ background: "var(--color-calendario)" }}
      >
        <p className="text-[12px] font-semibold tracking-[0.22em] text-white/70 uppercase">
          Nuestro tiempo
        </p>
        <h1 className="editorial mt-3 text-[2rem] leading-tight">Calendario</h1>
        <p className="mt-2 text-[16px] text-white/80">
          Las discucharlas próximas, las vividas y las que no pudieron ser.
        </p>
      </header>

      <nav className="mt-6 flex items-center justify-between" aria-label="Navegación por mes">
        <Link
          href={`/calendario?mes=${desplazarMes(mes, -1)}`}
          aria-label="Mes anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-linea)] text-[18px]"
        >
          ‹
        </Link>
        <h2 className="editorial text-[1.4rem] first-letter:uppercase">{nombreDelMes(mes)}</h2>
        <Link
          href={`/calendario?mes=${desplazarMes(mes, 1)}`}
          aria-label="Mes siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-linea)] text-[18px]"
        >
          ›
        </Link>
      </nav>

      {sesiones && sesiones.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {sesiones.map((s) => {
            const identidad = ESTADOS_SESION[s.status as EstadoSesion];
            return (
              <li key={s.id}>
                <Link
                  href={`/discucharla/${s.id}`}
                  className="flex gap-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/70 px-5 py-5"
                >
                  <div
                    className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-white"
                    style={{ background: "var(--color-calendario)" }}
                  >
                    <span className="editorial text-[1.3rem] leading-none">
                      {s.date ? new Date(`${s.date}T12:00:00Z`).getUTCDate() : "—"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className="text-[12px] font-semibold tracking-wide uppercase"
                      style={{ color: identidad.color }}
                    >
                      {identidad.texto}
                    </span>
                    <h3 className="mt-1 text-[17px] leading-snug font-medium">
                      {s.episode_title}
                    </h3>
                    <p className="mt-0.5 text-[15px] text-[var(--color-tinta-suave)]">
                      {s.podcast_name}
                    </p>
                    <p className="mt-1 text-[14px] text-[var(--color-tinta-suave)]">
                      {[s.date && fechaCorta(s.date), rangoHorario(s.start_time, s.end_time), s.place]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
          No hubo discucharlas este mes.
        </p>
      )}

      {admin && (
        <p className="mt-6 text-[14px] text-[var(--color-tinta-suave)]">
          Estás viendo también los borradores, que el resto del club no ve.
        </p>
      )}
    </main>
  );
}
