import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { fechaLarga, rangoHorario, cuentaRegresiva, diasFaltantes } from "@/lib/fechas";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const supabase = await crearClienteServidor();

  const [proxima, realizadas, propuestas, hilos, directorio] = await Promise.all([
    supabase.from("sessions").select("*").eq("status", "upcoming").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "past"),
    supabase
      .from("podcast_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("community_threads")
      .select("id, title, body, user_id, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(3),
    directorioDelClub(),
  ]);

  const sesion = proxima.data;

  return (
    <main className="px-6 pb-8">
      {/* ---------------------------------------------------------------- */}
      {/* Próxima sesión                                                    */}
      {/* ---------------------------------------------------------------- */}
      {sesion ? (
        <section className="grano relative mt-4 overflow-hidden rounded-[var(--radius-tarjeta)] bg-[var(--color-inicio)] p-7 text-white">
          <p className="text-[12px] font-semibold tracking-[0.22em] text-white/70 uppercase">
            Próxima sesión
          </p>
          <h1 className="editorial mt-3 text-[2rem] leading-[1.1]">{sesion.episode_title}</h1>
          <p className="mt-1.5 text-[16px] text-white/80">{sesion.podcast_name}</p>

          <dl className="mt-6 space-y-1 text-[16px] text-white/90">
            {sesion.date && (
              <div className="flex gap-2">
                <dt className="sr-only">Fecha</dt>
                <dd className="first-letter:uppercase">
                  {fechaLarga(sesion.date)}
                  <span className="text-white/60"> · {cuentaRegresiva(sesion.date)}</span>
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

          <div className="mt-7 flex flex-col gap-2.5">
            {sesion.episode_url ? (
              <a
                href={sesion.episode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-6 py-3.5 text-center text-[16px] font-medium text-[var(--color-inicio)]"
              >
                Escuchar episodio
              </a>
            ) : (
              <p className="rounded-full bg-white/15 px-6 py-3.5 text-center text-[15px] text-white/80">
                Todavía no hay enlace del episodio
              </p>
            )}
            <Link
              href={`/discucharla/${sesion.id}`}
              className="rounded-full border border-white/50 px-6 py-3.5 text-center text-[16px] font-medium text-white"
            >
              Ver sesión
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 p-7">
          <p className="text-[12px] font-semibold tracking-[0.22em] text-[var(--color-tinta-suave)] uppercase">
            Próxima sesión
          </p>
          <h1 className="editorial mt-3 text-[1.7rem] leading-tight">
            Todavía no hay fecha
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            En cuanto se cierre la votación y se agende, aparece aquí.
          </p>
          <Link
            href="/propuestas"
            className="mt-5 inline-block text-[16px] font-medium underline underline-offset-4"
          >
            Ver las propuestas
          </Link>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Contadores                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-tarjeta)] bg-[var(--color-linea)]">
        <Contador valor={realizadas.count ?? 0} etiqueta="realizadas" href="/nuestras-discucharlas" />
        <Contador
          valor={sesion?.date ? Math.max(0, diasFaltantes(sesion.date)) : 0}
          etiqueta="días para la próxima"
          href="/calendario"
          sinValor={!sesion?.date}
        />
        <Contador valor={propuestas.count ?? 0} etiqueta="propuestas" href="/propuestas" />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Accesos editoriales                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <AccesoEditorial
          href="/nuestras-discucharlas"
          titulo="Nuestras discucharlas"
          texto="La memoria del club, sesión por sesión."
        />
        <AccesoEditorial
          href="/guia"
          titulo="Guía del club"
          texto="Cómo funciona esto y cómo participamos."
        />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* La comunidad hoy                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="editorial text-[1.5rem]">La comunidad hoy</h2>
          <Link href="/comunidad" className="text-[15px] underline underline-offset-4">
            Ver todo
          </Link>
        </div>

        {hilos.data && hilos.data.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {hilos.data.map((hilo) => (
              <li key={hilo.id}>
                <Link
                  href={`/comunidad/${hilo.id}`}
                  className="block rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-[var(--color-comunidad)]/50 px-5 py-4"
                >
                  <p className="text-[14px] text-[var(--color-comunidad-fuerte)]">
                    {nombreDe(directorio, hilo.user_id)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[16px] leading-relaxed text-[var(--color-tinta)]">
                    {hilo.title ?? hilo.body}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white/60 px-5 py-5 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            Todavía no hay conversación. Puedes empezarla tú.
          </p>
        )}
      </section>
    </main>
  );
}

function Contador({
  valor,
  etiqueta,
  href,
  sinValor,
}: {
  valor: number;
  etiqueta: string;
  href: string;
  sinValor?: boolean;
}) {
  return (
    <Link href={href} className="bg-[var(--color-papel)] px-3 py-5 text-center">
      <span className="editorial block text-[1.9rem] leading-none text-[var(--color-tinta)]">
        {sinValor ? "—" : valor}
      </span>
      <span className="mt-1.5 block text-[12px] leading-tight text-[var(--color-tinta-suave)]">
        {etiqueta}
      </span>
    </Link>
  );
}

function AccesoEditorial({
  href,
  titulo,
  texto,
}: {
  href: string;
  titulo: string;
  texto: string;
}) {
  return (
    <Link
      href={href}
      className="grano relative block overflow-hidden rounded-[var(--radius-tarjeta)] p-6 text-white"
      style={{ background: "var(--color-subpagina)" }}
    >
      <h3 className="editorial text-[1.3rem] leading-tight">{titulo}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">{texto}</p>
    </Link>
  );
}
