import Link from "next/link";
import Image from "next/image";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { colajeDe } from "@/lib/colaje";
import { fechaLarga, hora } from "@/lib/fechas";
import { IconoCorazon } from "@/components/Iconos";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const supabase = await crearClienteServidor();

  const [proxima, hilos, directorio] = await Promise.all([
    supabase.from("sessions").select("*").eq("status", "upcoming").maybeSingle(),
    supabase
      .from("community_threads")
      .select("id, title, body, user_id, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(2),
    directorioDelClub(),
  ]);

  const sesion = proxima.data;
  const retrato = colajeDe("inicio-hero");

  return (
    <main className="px-5 pb-8">
      {/* ------------------------------------------------------------------ */}
      {/* Próxima discucharla                                                 */}
      {/* ------------------------------------------------------------------ */}
      {sesion ? (
        <section
          className="grano relative mt-4 overflow-hidden rounded-[var(--radius-tarjeta)]"
          style={{ background: "var(--color-tinta)" }}
        >
          {retrato ? (
            <Image
              src={retrato}
              alt=""
              fill
              priority
              sizes="430px"
              className="!left-auto !w-[44%] object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-[44%]"
              style={{
                background:
                  "radial-gradient(120% 90% at 70% 35%, var(--color-inicio) 0%, transparent 70%)",
                opacity: 0.75,
              }}
            />
          )}

          <div className="relative z-10 max-w-[62%] px-6 py-7 text-white">
            <span className="inline-block rounded-full border border-white/45 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
              Próxima discucharla
            </span>

            <h2 className="editorial mt-4 text-[1.85rem] leading-[1.1]">{sesion.episode_title}</h2>
            <div
              className="mt-4 h-[3px] w-14 rounded-full"
              style={{ background: "var(--color-inicio)" }}
            />

            <p className="mt-4 text-[14px] leading-snug text-white/85">
              {sesion.date && <span className="first-letter:uppercase">{fechaLarga(sesion.date)}</span>}
              {hora(sesion.start_time) && ` · ${hora(sesion.start_time)}`}
            </p>
            {sesion.place && <p className="text-[14px] text-white/70">{sesion.place}</p>}

            <div className="mt-6 space-y-2.5">
              {sesion.episode_url && (
                <a
                  href={sesion.episode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full px-5 py-3 text-[15px] font-medium text-white"
                  style={{ background: "var(--color-inicio)" }}
                >
                  Escuchar episodio →
                </a>
              )}
              <Link
                href={`/discucharla/${sesion.id}`}
                className="block rounded-full border border-white/50 px-5 py-3 text-[15px] font-medium text-white"
              >
                Ver detalle →
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 p-7">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--color-tinta-suave)] uppercase">
            Próxima discucharla
          </p>
          <h2 className="editorial mt-3 text-[1.6rem] leading-tight">Todavía no hay fecha</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
            En cuanto se cierre la votación y se agende, aparece aquí.
          </p>
          <Link
            href="/propuestas"
            className="mt-5 inline-block text-[15px] font-medium underline underline-offset-4"
          >
            Ver las propuestas
          </Link>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Accesos editoriales                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-3 space-y-3">
        <AccesoEditorial
          href="/nuestras-discucharlas"
          titulo="Nuestras discucharlas"
          texto="Explorar sesiones anteriores →"
          imagen={colajeDe("memorias")}
          color="var(--color-archivo)"
        />
        <AccesoEditorial
          href="/guia"
          titulo="Guía del club"
          texto="Conocer cómo funciona →"
          imagen={colajeDe("guia")}
          color="var(--color-subpagina)"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* La comunidad hoy                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mt-3 rounded-[var(--radius-tarjeta)] px-5 py-6"
        style={{ background: "color-mix(in oklab, var(--color-subpagina) 8%, var(--color-blanco))" }}
      >
        <p
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: "var(--color-subpagina)" }}
        >
          La comunidad hoy
        </p>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <h2 className="editorial text-[1.45rem] leading-tight">Conversaciones recientes</h2>
          <Link href="/comunidad" className="shrink-0 text-[14px] underline underline-offset-4">
            Ver todas
          </Link>
        </div>

        {hilos.data && hilos.data.length > 0 ? (
          <ul className="mt-4 space-y-2.5">
            {hilos.data.map((hilo) => (
              <li key={hilo.id}>
                <Link
                  href={`/comunidad/${hilo.id}`}
                  className="flex gap-3 rounded-[var(--radius-suave)] bg-[var(--color-blanco)] px-4 py-4"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
                    style={{ background: "var(--color-comunidad)" }}
                  >
                    {nombreDe(directorio, hilo.user_id).charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-snug font-medium">
                      {hilo.title ?? "Conversación"}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
                      {hilo.body}
                    </span>
                  </span>
                  <IconoCorazon className="h-5 w-5 shrink-0 text-[var(--color-inicio)]" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
            Todavía no hay conversación. Puedes empezarla tú.
          </p>
        )}
      </section>
    </main>
  );
}

function AccesoEditorial({
  href,
  titulo,
  texto,
  imagen,
  color,
}: {
  href: string;
  titulo: string;
  texto: string;
  imagen: string | null;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="relative flex min-h-[92px] overflow-hidden rounded-[var(--radius-tarjeta)] bg-[var(--color-blanco)]"
    >
      <div className="min-w-0 flex-1 px-5 py-5">
        <div className="h-[3px] w-9 rounded-full" style={{ background: color }} />
        <h3 className="editorial mt-2.5 text-[1.2rem] leading-tight">{titulo}</h3>
        <p className="mt-1 text-[13px] text-[var(--color-tinta-suave)]">{texto}</p>
      </div>
      <div className="relative w-[34%] shrink-0">
        {imagen ? (
          <Image src={imagen} alt="" fill sizes="150px" className="object-cover" />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 90%)`, opacity: 0.3 }}
          />
        )}
      </div>
    </Link>
  );
}
