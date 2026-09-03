import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { fechaLarga } from "@/lib/fechas";

export const metadata = { title: "Nuestras discucharlas" };

export default async function Memorias() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const [sesiones, stats] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("status", "past")
      .order("date", { ascending: false }),
    supabase.from("session_stats").select("*"),
  ]);

  const porSesion = new Map((stats.data ?? []).map((s) => [s.session_id, s]));

  return (
    <main className="px-5 pb-8">
      <Link
        href="/inicio"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <header
        className="grano relative mt-5 overflow-hidden rounded-[var(--radius-tarjeta)] px-6 py-7 text-white"
        style={{ background: "var(--color-subpagina)" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">
          La memoria del club
        </p>
        <h1 className="editorial mt-2.5 text-[1.9rem] leading-[1.08]">
          Nuestras discucharlas
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/75">
          Todo lo que hemos escuchado y conversado juntas.
        </p>
      </header>

      {sesiones.data && sesiones.data.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {sesiones.data.map((s) => {
            const dato = porSesion.get(s.id);
            const detalles = [
              s.date && fechaLarga(s.date),
              s.place,
              dato?.attendee_count ? `${dato.attendee_count} vinieron` : null,
              dato?.average_rating ? `${dato.average_rating} de 5` : null,
            ].filter(Boolean);

            return (
              <li key={s.id}>
                <Link
                  href={`/discucharla/${s.id}`}
                  className="block rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] px-5 py-5"
                >
                  <h2 className="editorial text-[1.25rem] leading-snug">{s.episode_title}</h2>
                  <p className="mt-0.5 text-[14px] text-[var(--color-tinta-suave)]">
                    {s.podcast_name}
                  </p>
                  <p className="mt-2 text-[13px] text-[var(--color-tinta-suave)] first-letter:uppercase">
                    {detalles.join(" · ")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          Todavía no hay ninguna guardada. La primera memoria llega después de la primera
          discucharla.
        </p>
      )}
    </main>
  );
}
