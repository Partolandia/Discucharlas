import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { textoRsvp, textoAporte } from "@/lib/dominio";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { alternarAsistencia } from "@/app/(admin)/admin/acciones";

export default async function AsistenciaDeDiscucharla({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await crearClienteServidor();

  const { data: sesion } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
  if (!sesion) notFound();

  const [rsvps, aportes, asistencia, directorio] = await Promise.all([
    supabase.from("session_rsvps").select("user_id, response").eq("session_id", id),
    supabase.from("session_bring_selections").select("user_id, category, detail").eq("session_id", id),
    supabase.from("session_attendance").select("user_id, present").eq("session_id", id),
    directorioDelClub(),
  ]);

  const respuesta = new Map((rsvps.data ?? []).map((r) => [r.user_id, r.response]));
  const presentes = new Set(
    (asistencia.data ?? []).filter((a) => a.present).map((a) => a.user_id)
  );
  const integrantes = [...directorio.values()].sort((a, b) =>
    (a.first_name ?? "").localeCompare(b.first_name ?? "", "es")
  );

  return (
    <main className="px-5 pb-8">
      <Link
        href="/admin/discucharlas"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a discucharlas
      </Link>

      <h1 className="editorial mt-5 text-[1.7rem] leading-tight">{sesion.episode_title}</h1>
      <p className="mt-1 text-[15px] text-[var(--color-tinta-suave)]">{sesion.podcast_name}</p>

      {/* ------------------------------------------------------------------ */}
      {/* Asistencia real                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-8">
        <h2 className="editorial text-[1.4rem]">Asistencia real</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
          Puede no coincidir con lo que cada quien confirmó. Manda esto, no el RSVP.
        </p>

        <ul className="mt-4 space-y-2">
          {integrantes.map((i) => {
            const nombre = nombreDe(directorio, i.id);
            const vino = presentes.has(i.id);
            return (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-[var(--color-blanco)] px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium">{nombre}</span>
                  <span className="text-[13px] text-[var(--color-tinta-suave)]">
                    {textoRsvp(respuesta.get(i.id)) ?? "Sin responder"}
                  </span>
                </span>
                <BotonAccion
                  accion={alternarAsistencia}
                  campos={{ sesion: id, integrante: i.id }}
                  tono={vino ? "principal" : "normal"}
                >
                  {vino ? "Vino ✓" : "Marcar que vino"}
                </BotonAccion>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[15px] text-[var(--color-tinta-suave)]">
          {presentes.size} {presentes.size === 1 ? "asistente" : "asistentes"} registradas.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Resumen de aportes                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-9">
        <h2 className="editorial text-[1.4rem]">Qué lleva cada quien</h2>
        {aportes.data && aportes.data.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-[15px]">
            {aportes.data.map((a) => (
              <li key={`${a.user_id}-${a.category}`} className="text-[var(--color-tinta-suave)]">
                <span className="text-[var(--color-tinta)]">{nombreDe(directorio, a.user_id)}</span>
                {" lleva "}
                {a.category === "otro" && a.detail ? a.detail : textoAporte(a.category)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[15px] text-[var(--color-tinta-suave)]">
            Todavía nadie ha dicho qué lleva.
          </p>
        )}
      </section>
    </main>
  );
}
