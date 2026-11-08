import "@/estilos/prototipo-v2.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { accesoDeInvitada } from "@/lib/invitada";
import { salirComoInvitada } from "@/app/invitada/acciones";
import { fechaLarga, rangoHorario } from "@/lib/fechas";
import { IMAGENES } from "@/lib/prototipo";

export const metadata = { title: "Próxima discucharla" };

export default async function InicioDeInvitada() {
  const idAcceso = await accesoDeInvitada();
  if (!idAcceso) redirect("/invitada");

  const admin = crearClienteAdministrador();

  // Se comprueba en cada visita: si administración revocó la clave, el acceso
  // se corta aquí mismo, sin esperar a que caduque la cookie.
  const { data: acceso } = await admin
    .from("guest_access")
    .select("id")
    .eq("id", idAcceso)
    .eq("status", "active")
    .maybeSingle();
  if (!acceso) redirect("/invitada?motivo=revocada");

  // Solo lo que le toca ver: la próxima sesión, la guía y las realizadas.
  // Nada de comunidad, perfiles ni notas, y solo estos campos.
  const [sesion, anteriores] = await Promise.all([
    admin
      .from("sessions")
      .select("episode_title, podcast_name, episode_url, date, start_time, end_time, place, summary")
      .eq("status", "upcoming")
      .maybeSingle(),
    admin
      .from("sessions")
      .select("id, episode_title, date, image_path")
      .eq("status", "past")
      .order("date", { ascending: false })
      .limit(5),
  ]);

  const cuando = sesion.data
    ? [
        sesion.data.date ? capitalizar(fechaLarga(sesion.data.date)) : null,
        rangoHorario(sesion.data.start_time, sesion.data.end_time),
        sesion.data.place,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <main className="stage">
      <section className="phone" data-section="inicio">
        <section className="page guest-view active" id="invitado">
          <section className="guest-welcome-intro" aria-label="Bienvenida a Discucharlas">
            <div className="guest-welcome-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="guest-welcome-logo" alt="Discucharlas" src={IMAGENES.logo} />
              <h1>¡Hola!</h1>
            </div>
            <p className="guest-welcome-lead">Te damos la bienvenida a Discucharlas.</p>
            <p className="guest-welcome-sub">
              {sesion.data
                ? "Esto es lo que estamos por conversar."
                : "Por el momento no hay una próxima sesión definida."}
            </p>
          </section>

          <article className="guest-card">
            <div className="eyebrow" style={{ color: "var(--coral)" }}>
              PRÓXIMA DISCUCHARLA
            </div>
            {sesion.data ? (
              <>
                <h1>{sesion.data.episode_title}</h1>
                <p>
                  {cuando}
                  {sesion.data.podcast_name && (
                    <>
                      <br />
                      {sesion.data.podcast_name}
                    </>
                  )}
                </p>
                {sesion.data.summary && <p>{sesion.data.summary}</p>}
                {sesion.data.episode_url && (
                  <a href={sesion.data.episode_url} target="_blank" rel="noopener noreferrer">
                    Escuchar episodio　→
                  </a>
                )}
              </>
            ) : (
              <>
                <h1>Por el momento no hay una próxima Discucharla definida</h1>
                <p>Cuando se confirme una nueva sesión, aparecerá aquí.</p>
              </>
            )}
          </article>

          <Link className="guest-guide-access" href="/invitada/guia" aria-label="Abrir Guía del club">
            <span className="guest-guide-mark" aria-hidden="true">
              ↗
            </span>
            <span className="guest-guide-copy">
              <small>CONOCE EL CÍRCULO</small>
              <strong>Guía del club</strong>
              <em>Cómo funciona Discucharlas y cuáles son nuestras reglas.</em>
            </span>
            <span className="guest-guide-arrow" aria-hidden="true">
              ›
            </span>
          </Link>

          <section className="guest-history-preview" aria-labelledby="guestHistoryTitle">
            <div className="guest-history-head">
              <div className="eyebrow">PARA CONOCER EL CLUB</div>
              <h2 id="guestHistoryTitle">Discucharlas anteriores</h2>
              <p>Una mirada a algunos de los temas que ya hemos conversado.</p>
            </div>
            <div className="guest-history-list">
              {anteriores.data && anteriores.data.length > 0 ? (
                anteriores.data.map((s) => (
                  <div key={s.id} className="archive-item-editorial guest-history-item">
                    {s.image_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="archive-cover archive-cover-art" src={s.image_path} alt="" />
                    ) : (
                      <span className="archive-cover archive-cover-initial">
                        {s.episode_title.charAt(0).toLowerCase()}
                      </span>
                    )}
                    <div className="archive-item-copy">
                      <span className="status archive-status-past">REALIZADA</span>
                      <h3>{s.episode_title}</h3>
                      {s.date && <p>{capitalizar(fechaLarga(s.date))}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="guest-history-empty">
                  Todavía no hay Discucharlas realizadas para mostrar.
                </div>
              )}
            </div>
          </section>

          <form action={salirComoInvitada}>
            <button className="link" type="submit" style={{ marginTop: "14px" }}>
              Salir de vista de invitado
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
