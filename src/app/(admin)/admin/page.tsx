import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaLarga } from "@/lib/fechas";

export const metadata = { title: "Administración" };

const SECCIONES = [
  {
    href: "/admin/discucharlas",
    titulo: "Discucharlas",
    texto: "Crear, activar la próxima, cancelar y registrar asistencia real.",
  },
  {
    href: "/admin/votacion",
    titulo: "Votación",
    texto: "Elegir candidaturas, abrir la ronda y cerrarla con su resultado.",
  },
  {
    href: "/admin/integrantes",
    titulo: "Integrantes",
    texto: "Roles, suspensiones y propiedad del club.",
  },
  {
    href: "/admin/accesos",
    titulo: "Accesos",
    texto: "Invitaciones de integrante y clave de invitadas.",
  },
];

export default async function PanelAdmin() {
  const supabase = await crearClienteServidor();

  const [proxima, ronda, solicitudes, borradores] = await Promise.all([
    supabase.from("sessions").select("*").eq("status", "upcoming").maybeSingle(),
    supabase.from("voting_rounds").select("*").in("status", ["draft", "open"]).maybeSingle(),
    supabase
      .from("member_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "draft"),
  ]);

  return (
    <main className="px-5 pb-8">
      <section
        className="mt-5 rounded-[var(--radius-tarjeta)] px-5 py-5"
        style={{ background: "var(--color-blanco)" }}
      >
        <h1 className="editorial text-[1.5rem] leading-tight">Cómo va el club</h1>

        <dl className="mt-4 space-y-3 text-[15px]">
          <Renglon etiqueta="Próxima discucharla">
            {proxima.data ? (
              <>
                {proxima.data.episode_title}
                {proxima.data.date && (
                  <span className="text-[var(--color-tinta-suave)]">
                    {" · "}
                    {fechaLarga(proxima.data.date)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[var(--color-tinta-suave)]">Sin agendar</span>
            )}
          </Renglon>

          <Renglon etiqueta="Votación">
            {ronda.data ? (
              ronda.data.status === "open" ? (
                "Abierta"
              ) : (
                "En preparación"
              )
            ) : (
              <span className="text-[var(--color-tinta-suave)]">Ninguna</span>
            )}
          </Renglon>

          <Renglon etiqueta="Propuestas de integrante">
            {solicitudes.count
              ? `${solicitudes.count} por revisar`
              : <span className="text-[var(--color-tinta-suave)]">Ninguna pendiente</span>}
          </Renglon>

          <Renglon etiqueta="Borradores">
            {borradores.count
              ? `${borradores.count} sin publicar`
              : <span className="text-[var(--color-tinta-suave)]">Ninguno</span>}
          </Renglon>
        </dl>
      </section>

      <ul className="mt-4 space-y-3">
        {SECCIONES.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] px-5 py-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-[3px] w-8 shrink-0 rounded-full"
                  style={{ background: "var(--color-admin-oro)" }}
                />
                <h2 className="editorial text-[1.25rem] leading-tight">{s.titulo}</h2>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
                {s.texto}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Renglon({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--color-linea)] pb-3 last:border-b-0 last:pb-0">
      <dt className="shrink-0 text-[var(--color-tinta-suave)]">{etiqueta}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
