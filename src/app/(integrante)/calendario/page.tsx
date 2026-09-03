import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { ZONA_HORARIA_CLUB } from "@/lib/entorno";
import { hora } from "@/lib/fechas";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";
import { EncabezadoSeccion } from "@/components/EncabezadoSeccion";
import { RejillaMes } from "@/components/calendario/RejillaMes";

export const metadata = { title: "Calendario" };

const MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

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
  return new Date(Date.UTC(anio, m - 1 + delta, 1)).toISOString().slice(0, 7);
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
  // RLS ya esconde los borradores a quien no administra.
  const { data: sesiones } = await supabase
    .from("sessions")
    .select("*")
    .gte("date", `${mes}-01`)
    .lt("date", `${desplazarMes(mes, 1)}-01`)
    .order("date");

  return (
    <main className="px-5 pb-8">
      <EncabezadoSeccion clave="calendario" />

      <RejillaMes
        mes={mes}
        sesiones={sesiones ?? []}
        hrefMes={(m) => `/calendario?mes=${m}`}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Lista del mes                                                       */}
      {/* ------------------------------------------------------------------ */}
      <h3
        className="mt-7 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: "var(--color-calendario-fuerte)" }}
      >
        <span className="h-px w-5" style={{ background: "var(--color-calendario)" }} />
        Discucharlas del mes
      </h3>

      {sesiones && sesiones.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {sesiones.map((s) => {
            const identidad = ESTADOS_SESION[s.status as EstadoSesion];
            const dia = s.date ? Number(s.date.slice(8, 10)) : null;
            const mesTexto = s.date ? MES_CORTO[Number(s.date.slice(5, 7)) - 1] : "";

            return (
              <li key={s.id}>
                <Link
                  href={`/discucharla/${s.id}`}
                  className="flex items-center gap-4 rounded-[var(--radius-tarjeta)] bg-[var(--color-blanco)] px-4 py-4"
                >
                  <span
                    className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius-suave)]"
                    style={{ background: "var(--color-calendario-suave)" }}
                  >
                    <span
                      className="editorial text-[1.25rem] leading-none"
                      style={{ color: "var(--color-calendario-fuerte)" }}
                    >
                      {dia ?? "—"}
                    </span>
                    <span
                      className="mt-0.5 text-[10px] tracking-wider uppercase"
                      style={{ color: "var(--color-calendario-fuerte)" }}
                    >
                      {mesTexto}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] tracking-wide text-[var(--color-tinta-suave)] uppercase">
                      {[hora(s.start_time), identidad.texto].filter(Boolean).join(" · ")}
                    </span>
                    <span className="editorial mt-0.5 block text-[1.1rem] leading-snug">
                      {s.episode_title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-[var(--color-tinta-suave)]">
                      {s.place ?? "Lugar sin registrar"}
                    </span>
                  </span>

                  <span
                    className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
                    style={{ borderColor: identidad.color, color: identidad.color }}
                  >
                    {identidad.texto}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          No hubo discucharlas este mes.
        </p>
      )}

      {esAdministradora(perfil) && (
        <p className="mt-5 text-[13px] text-[var(--color-tinta-suave)]">
          Estás viendo también los borradores, que el resto del club no ve.
        </p>
      )}
    </main>
  );
}
