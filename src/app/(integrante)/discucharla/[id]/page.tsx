import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { fechaLarga, hora12, rangoHorario } from "@/lib/fechas";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";
import { Backline } from "@/components/prototipo/Backline";
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
  const esAdmin = esAdministradora(perfil);

  const miRsvp = rsvps.data?.find((r) => r.user_id === perfil.id)?.response ?? null;
  const misAportes = aportes.data?.filter((a) => a.user_id === perfil.id) ?? [];

  // El prototipo muestra en cada opción quién la eligió, no solo el conteo.
  const porRespuesta: Record<string, string[]> = {};
  for (const r of rsvps.data ?? []) {
    (porRespuesta[r.response] ??= []).push(nombreDe(directorio, r.user_id));
  }
  const porCategoria: Record<string, string[]> = {};
  for (const a of aportes.data ?? []) {
    if (a.category === "otro") continue;
    (porCategoria[a.category] ??= []).push(nombreDe(directorio, a.user_id));
  }
  const otros = (aportes.data ?? [])
    .filter((a) => a.category === "otro" && a.detail)
    .map((a) => ({ nombre: nombreDe(directorio, a.user_id), detalle: a.detail as string }));

  const cuando = [
    sesion.date ? capitalizar(fechaLarga(sesion.date)) : null,
    rangoHorario(sesion.start_time, sesion.end_time) || hora12(sesion.start_time),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="page session-page active" id="sesion">
      <header className="session-stage-head">
        <div className="session-head-row">
          <Backline a="/calendario" texto="Volver al calendario" />
          <div>
            <div className="eyebrow">SESIÓN</div>
            <h1>Discucharla</h1>
          </div>
        </div>
      </header>

      <article className="session-editorial-hero">
        <div className="session-hero-copy">
          <div className="eyebrow">{identidad.texto.toUpperCase()}</div>
          <h1>{sesion.episode_title}</h1>
          <div className="session-hero-rule" />
          <div className="detail-meta">
            {cuando}
            {sesion.place && (
              <>
                <br />
                {sesion.place}
              </>
            )}
            {sesion.podcast_name && (
              <>
                <br />
                {sesion.podcast_name}
              </>
            )}
          </div>
          {sesion.episode_url && (
            <a
              className="listen-btn"
              href={sesion.episode_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escuchar episodio　→
            </a>
          )}
        </div>
        <div
          className="detail-photo session-hero-photo"
          style={
            sesion.image_path
              ? { backgroundImage: `url(${sesion.image_path})`, backgroundSize: "cover" }
              : undefined
          }
        />
      </article>

      {estado === "cancelled" && (
        <div className="cloud-next-step">
          <b>Esta discucharla se canceló.</b>
          <br />
          Se queda aquí como parte de la historia del club.
        </div>
      )}

      {abierta && (
        <>
          <div className="session-section-label planning-label">
            <span>ANTES DE LA SESIÓN</span>
            <b>Organizamos el encuentro</b>
          </div>

          <Asistencia sesion={id} miRespuesta={miRsvp} quienes={porRespuesta} />

          <Aportes
            sesion={id}
            misCategorias={misAportes.map((a) => a.category)}
            detalleOtro={misAportes.find((a) => a.category === "otro")?.detail ?? null}
            quienes={porCategoria}
            otros={otros}
          />
        </>
      )}

      <div className="session-section-label conversation-label">
        <span>PARA LLEGAR CON IDEAS</span>
        <b>Contenido y conversación</b>
      </div>

      <section className="content-card session-card session-card-summary">
        <div className="session-card-icon">“</div>
        <span className="mini-kicker">RESUMEN</span>
        <h2>De qué trata este episodio</h2>
        <div>
          {sesion.summary ? (
            <p style={{ whiteSpace: "pre-line" }}>{sesion.summary}</p>
          ) : (
            <p className="compact-empty">Aún no agregamos el resumen de este episodio.</p>
          )}
        </div>
      </section>

      <NotaPrivada sesion={id} nota={nota.data?.note ?? ""} />

      <section className="content-card session-card session-card-media">
        <div className="session-card-head">
          <div>
            <span className="mini-kicker">PARA COMPARTIR</span>
            <h2>Fotos y materiales</h2>
          </div>
          <p className="session-head-note">
            Links, artículos, posts, imágenes o cualquier cosa que sume a la conversación.
          </p>
        </div>
        {materiales.data && materiales.data.length > 0 ? (
          <ul className="session-material-list">
            {materiales.data.map((m) => (
              <li key={m.id}>
                <a href={m.url_or_path} target="_blank" rel="noopener noreferrer">
                  {m.title}
                </a>
                <small> · {nombreDe(directorio, m.user_id)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-gallery">Todavía no hay fotografías ni materiales.</div>
        )}
        <AgregarEnlace sesion={id} />
      </section>

      <section className="content-card session-card session-card-comments">
        <span className="mini-kicker">CONVERSACIÓN ABIERTA</span>
        <h2>Comentarios</h2>
        <p>La conversación puede empezar antes de vernos y seguir después.</p>
        <div className="session-comments-list">
          {comentarios.data && comentarios.data.length > 0 ? (
            comentarios.data.map((c) => (
              <article key={c.id} className="session-comment">
                <b>{nombreDe(directorio, c.user_id)}</b>
                <p style={{ whiteSpace: "pre-line" }}>{c.body}</p>
              </article>
            ))
          ) : (
            <div className="comment-empty">Todavía no hay comentarios.</div>
          )}
        </div>
        <Comentar sesion={id} />
      </section>

      {realizada && (
        <>
          <div className="session-section-label post-label">
            <span>DESPUÉS DEL ENCUENTRO</span>
            <b>Memoria de la sesión</b>
          </div>

          <Calificacion
            sesion={id}
            miCalificacion={miCalificacion.data?.rating ?? null}
            promedio={stats.data?.average_rating ?? null}
          />

          {esAdmin && asistencia.data && asistencia.data.some((a) => a.present) && (
            <section className="content-card session-card club-actual">
              <div className="club-kicker">SOLO ADMINISTRACIÓN</div>
              <h3>Asistencia real</h3>
              <p className="club-muted">Este registro no se muestra a las integrantes.</p>
              <p>
                {asistencia.data
                  .filter((a) => a.present)
                  .map((a) => nombreDe(directorio, a.user_id))
                  .join(", ")}
              </p>
            </section>
          )}
        </>
      )}
    </section>
  );
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
