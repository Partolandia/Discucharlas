import { redirect } from "next/navigation";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { accesoDeInvitada } from "@/lib/invitada";
import { salirComoInvitada } from "@/app/invitada/acciones";
import { fechaLarga, rangoHorario } from "@/lib/fechas";

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

  // Solo lo que le toca ver: la próxima sesión y la guía. Nada de comunidad,
  // perfiles ni historial, y solo estos campos.
  const [sesion, guia] = await Promise.all([
    admin
      .from("sessions")
      .select("episode_title, podcast_name, episode_url, date, start_time, end_time, place, summary")
      .eq("status", "upcoming")
      .maybeSingle(),
    admin.from("guide_sections").select("id, title, body").order("sort_order"),
  ]);

  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-10">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--color-tinta-suave)] uppercase">
        Discucharlas · invitada
      </p>

      {sesion.data ? (
        <section
          className="grano relative mt-5 overflow-hidden rounded-[var(--radius-tarjeta)] px-6 py-7 text-white"
          style={{ background: "var(--color-tinta)" }}
        >
          <span className="inline-block rounded-full border border-white/45 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
            Próxima discucharla
          </span>
          <h1 className="editorial mt-4 text-[1.9rem] leading-[1.1]">
            {sesion.data.episode_title}
          </h1>
          <p className="mt-1.5 text-[15px] text-white/75">{sesion.data.podcast_name}</p>

          <div
            className="mt-4 h-[3px] w-14 rounded-full"
            style={{ background: "var(--color-inicio)" }}
          />

          <p className="mt-4 text-[15px] leading-snug text-white/85">
            {sesion.data.date && (
              <span className="first-letter:uppercase">{fechaLarga(sesion.data.date)}</span>
            )}
            {rangoHorario(sesion.data.start_time, sesion.data.end_time) &&
              ` · ${rangoHorario(sesion.data.start_time, sesion.data.end_time)}`}
          </p>
          {sesion.data.place && (
            <p className="text-[15px] text-white/70">{sesion.data.place}</p>
          )}

          {sesion.data.summary && (
            <p className="mt-4 text-[15px] leading-relaxed text-white/75">
              {sesion.data.summary}
            </p>
          )}

          {sesion.data.episode_url && (
            <a
              href={sesion.data.episode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block rounded-full px-5 py-3 text-center text-[15px] font-medium text-white"
              style={{ background: "var(--color-inicio)" }}
            >
              Escuchar episodio →
            </a>
          )}
        </section>
      ) : (
        <section className="mt-5 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-7">
          <h1 className="editorial text-[1.6rem] leading-tight">Todavía no hay fecha</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
            En cuanto el club agende la próxima, la verás aquí.
          </p>
        </section>
      )}

      {guia.data && guia.data.length > 0 && (
        <section className="mt-9">
          <h2 className="editorial text-[1.5rem]">Cómo funciona esto</h2>
          <div className="mt-4 space-y-6">
            {guia.data.map((s) => (
              <div key={s.id}>
                <h3 className="text-[16px] font-medium">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-tinta-suave)] whitespace-pre-line">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <form action={salirComoInvitada} className="mt-10 border-t border-[var(--color-linea)] pt-6">
        <button
          type="submit"
          className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
        >
          Salir
        </button>
      </form>
    </main>
  );
}
