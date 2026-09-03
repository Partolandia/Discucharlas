import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { exigirIntegrante } from "@/lib/sesion";
import { fechaLarga, rangoHorario, cuentaRegresiva } from "@/lib/fechas";
import { ESTADOS_SESION, RESPUESTAS_RSVP, textoAporte, type EstadoSesion } from "@/lib/dominio";
import { Asistencia } from "@/components/discucharla/Asistencia";
import { Aportes } from "@/components/discucharla/Aportes";
import { NotaPrivada } from "@/components/discucharla/NotaPrivada";
import { Calificacion } from "@/components/discucharla/Calificacion";
import { Comentar } from "@/components/discucharla/Comentar";
import { AgregarEnlace } from "@/components/discucharla/AgregarEnlace";

export default async function Discucharla({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data: sesion } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
  // RLS ya esconde los borradores a quien no administra: si no llegó, no existe
  // para esta persona.
  if (!sesion) notFound();

  const [rsvps, aportes, nota, comentarios, materiales, miCalificacion, stats, asistencia, directorio] =
    await Promise.all([
      supabase.from("session_rsvps").select("user_id, response").eq("session_id", id),
      supabase.from("session_bring_selections").select("user_id, category, detail").eq("session_id", id),
      supabase.from("session_private_notes").select("note").eq("session_id", id).maybeSingle(),
      supabase
        .from("session_comments")
        .select("id, user_id, body, created_at")
        .eq("session_id", id)
        .is("deleted_at", null)
        .order("created_at"),
      supabase.from("session_materials").select("*").eq("session_id", id).order("created_at"),
      supabase.from("session_ratings").select("rating").eq("session_id", id).maybeSingle(),
      supabase.from("session_stats").select("*").eq("session_id", id).maybeSingle(),
      supabase.from("session_attendance").select("user_id, present").eq("session_id", id),
      directorioDelClub(),
    ]);

  const estado = sesion.status as EstadoSesion;
  const abierta = estado === "upcoming";
  const realizada = estado === "past";
  const identidad = ESTADOS_SESION[estado];

  const miRsvp = rsvps.data?.find((r) => r.user_id === perfil.id)?.response ?? null;
  const misAportes = aportes.data?.filter((a) => a.user_id === perfil.id) ?? [];

  return (
    <main className="px-6 pb-10">
      <Link
        href="/calendario"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver al calendario
      </Link>

      {/* ------------------------------------------------------------------ */}
      {/* Encabezado                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header className="mt-5">
        <span
          className="inline-block rounded-full px-3 py-1 text-[12px] font-semibold tracking-wide text-white uppercase"
          style={{ background: identidad.color }}
        >
          {identidad.texto}
        </span>
        <h1 className="editorial mt-4 text-[2.1rem] leading-[1.08]">{sesion.episode_title}</h1>
        <p className="mt-1.5 text-[17px] text-[var(--color-tinta-suave)]">{sesion.podcast_name}</p>

        <dl className="mt-5 space-y-1 text-[16px] text-[var(--color-tinta)]">
          {sesion.date && (
            <div>
              <dt className="sr-only">Fecha</dt>
              <dd className="first-letter:uppercase">
                {fechaLarga(sesion.date)}
                {abierta && (
                  <span className="text-[var(--color-tinta-suave)]">
                    {" "}
                    · {cuentaRegresiva(sesion.date)}
                  </span>
                )}
              </dd>
            </div>
          )}
          {rangoHorario(sesion.start_time, sesion.end_time) && (
            <div>
              <dt className="sr-only">Horario</dt>
              <dd>{rangoHorario(sesion.start_time, sesion.end_time)}</dd>
            </div>
          )}
          {sesion.place && (
            <div>
              <dt className="sr-only">Lugar</dt>
              <dd>{sesion.place}</dd>
            </div>
          )}
        </dl>

        {sesion.summary && (
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            {sesion.summary}
          </p>
        )}

        {sesion.episode_url && (
          <a
            href={sesion.episode_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded-full bg-[var(--color-inicio)] px-6 py-3.5 text-center text-[16px] font-medium text-white"
          >
            Escuchar episodio
          </a>
        )}
      </header>

      {estado === "cancelled" && (
        <p className="mt-8 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white/70 px-5 py-4 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
          Esta discucharla se canceló. Se queda aquí como parte de la historia del club.
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Preparación: solo mientras la sesión sigue en pie                    */}
      {/* ------------------------------------------------------------------ */}
      {abierta && (
        <>
          <section className="mt-10">
            <Asistencia sesion={id} miRespuesta={miRsvp} />
            <div className="mt-5 space-y-3">
              {RESPUESTAS_RSVP.map((r) => {
                const quienes = rsvps.data?.filter((v) => v.response === r.valor) ?? [];
                if (quienes.length === 0) return null;
                return (
                  <div key={r.valor} className="text-[15px]">
                    <span style={{ color: r.color }} className="font-medium">
                      {r.texto}
                    </span>
                    <span className="text-[var(--color-tinta-suave)]">
                      {" — "}
                      {quienes.map((v) => nombreDe(directorio, v.user_id)).join(", ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-10">
            <Aportes
              sesion={id}
              misCategorias={misAportes.map((a) => a.category)}
              detalleOtro={misAportes.find((a) => a.category === "otro")?.detail ?? null}
            />
            {aportes.data && aportes.data.length > 0 && (
              <ul className="mt-5 space-y-1.5 text-[15px]">
                {aportes.data.map((a) => (
                  <li key={`${a.user_id}-${a.category}`} className="text-[var(--color-tinta-suave)]">
                    <span className="text-[var(--color-tinta)]">
                      {nombreDe(directorio, a.user_id)}
                    </span>
                    {" lleva "}
                    {a.category === "otro" && a.detail ? a.detail : textoAporte(a.category)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Memoria: cuando ya pasó                                             */}
      {/* ------------------------------------------------------------------ */}
      {realizada && (
        <>
          <section className="mt-10">
            <Calificacion
              sesion={id}
              miCalificacion={miCalificacion.data?.rating ?? null}
              promedio={stats.data?.average_rating ?? null}
            />
          </section>

          {asistencia.data && asistencia.data.some((a) => a.present) && (
            <section className="mt-10">
              <h2 className="editorial text-[1.5rem]">Quiénes vinieron</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
                {asistencia.data
                  .filter((a) => a.present)
                  .map((a) => nombreDe(directorio, a.user_id))
                  .join(", ")}
              </p>
            </section>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Notas privadas                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-10 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-papel-hondo)] p-6">
        <NotaPrivada sesion={id} nota={nota.data?.note ?? ""} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Conversación y materiales                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-10">
        <h2 className="editorial text-[1.5rem]">La conversación</h2>

        {comentarios.data && comentarios.data.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {comentarios.data.map((c) => (
              <li
                key={c.id}
                className="rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white/70 px-5 py-4"
              >
                <p className="text-[14px] text-[var(--color-tinta-suave)]">
                  {nombreDe(directorio, c.user_id)}
                </p>
                <p className="mt-1.5 text-[16px] leading-relaxed whitespace-pre-line">{c.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            Todavía nadie ha comentado. Puedes empezar tú.
          </p>
        )}

        <div className="mt-5">
          <Comentar sesion={id} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="editorial text-[1.5rem]">Materiales</h2>
        {materiales.data && materiales.data.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {materiales.data.map((m) => (
              <li key={m.id}>
                <a
                  href={m.url_or_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white/70 px-5 py-4"
                >
                  <span className="text-[16px] font-medium underline underline-offset-4">
                    {m.title}
                  </span>
                  <span className="mt-1 block text-[14px] text-[var(--color-tinta-suave)]">
                    {nombreDe(directorio, m.user_id)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            Aún no hay nada compartido para esta discucharla.
          </p>
        )}
        <div className="mt-5">
          <AgregarEnlace sesion={id} />
        </div>
      </section>
    </main>
  );
}
