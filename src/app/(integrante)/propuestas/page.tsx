import Link from "next/link";
import Image from "next/image";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { colajeDe } from "@/lib/colaje";
import { EncabezadoSeccion } from "@/components/EncabezadoSeccion";
import { ProponerPodcast } from "@/components/propuestas/ProponerPodcast";
import { AccionesPropuesta } from "@/components/propuestas/AccionesPropuesta";

export const metadata = { title: "Propuestas" };

export default async function Propuestas() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();
  const admin = esAdministradora(perfil);

  const [ronda, propuestas, directorio] = await Promise.all([
    supabase.from("voting_rounds").select("*").eq("status", "open").maybeSingle(),
    supabase
      .from("podcast_proposals")
      .select("*")
      .in("status", admin ? ["active", "suspended"] : ["active"])
      .order("created_at", { ascending: false }),
    directorioDelClub(),
  ]);

  const votacion = ronda.data;
  const imagenVotacion = colajeDe("propuestas");

  return (
    <main className="px-5 pb-8">
      <EncabezadoSeccion clave="propuestas" />

      {/* ------------------------------------------------------------------ */}
      {/* Votación activa                                                     */}
      {/* ------------------------------------------------------------------ */}
      {votacion ? (
        <section
          className="grano relative mt-2 overflow-hidden rounded-[var(--radius-tarjeta)]"
          style={{ background: "var(--color-votacion)" }}
        >
          {imagenVotacion ? (
            <Image
              src={imagenVotacion}
              alt=""
              fill
              sizes="430px"
              className="!left-auto !w-[42%] object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-[42%]"
              style={{
                background:
                  "radial-gradient(120% 90% at 65% 40%, var(--color-votacion-acento) 0%, transparent 72%)",
              }}
            />
          )}

          <div className="relative z-10 max-w-[64%] px-6 py-7 text-white">
            <span
              className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase"
              style={{ background: "var(--color-votacion-sello)", color: "var(--color-tinta)" }}
            >
              Votación activa
            </span>
            <h2 className="editorial mt-4 text-[1.6rem] leading-[1.12]">
              {votacion.title ?? "¿Qué escuchamos después?"}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
              Ya está abierta la selección de episodios. Puedes votar y cambiar tu elección.
            </p>
            <Link
              href="/propuestas/votar"
              className="mt-5 inline-block rounded-full px-6 py-3 text-[15px] font-medium text-white"
              style={{ background: "var(--color-votacion-boton)" }}
            >
              Ir a votar →
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-2 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-6">
          <h2 className="editorial text-[1.4rem] leading-tight">No hay votación abierta</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
            Cuando administración abra la siguiente, aparece aquí. Mientras tanto puedes
            dejar propuestas en el banco.
          </p>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Banco de propuestas                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-9 flex items-baseline justify-between gap-3">
        <h2 className="editorial text-[1.7rem] leading-tight">Podcasts propuestos</h2>
        <span className="shrink-0 text-[14px] text-[var(--color-tinta-suave)]">
          {propuestas.data?.length ?? 0}
          {propuestas.data?.length === 1 ? " propuesta" : " propuestas"}
        </span>
      </div>

      <div className="mt-4">
        <ProponerPodcast />
      </div>

      {propuestas.data && propuestas.data.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {propuestas.data.map((p) => (
            <li
              key={p.id}
              className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
            >
              {p.duration && (
                <p
                  className="text-[12px] font-medium"
                  style={{ color: "var(--color-propuestas-fuerte)" }}
                >
                  Duración {p.duration}
                </p>
              )}
              <h3 className="editorial mt-1 text-[1.25rem] leading-snug">{p.episode_title}</h3>
              <p
                className="mt-0.5 text-[14px]"
                style={{ color: "var(--color-propuestas-fuerte)" }}
              >
                {p.podcast_name}
              </p>

              {p.description && (
                <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
                  {p.description}
                </p>
              )}

              <p className="mt-3 text-[13px] text-[var(--color-tinta-suave)]">
                Propuesto por {nombreDe(directorio, p.proposed_by)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
                  style={
                    p.status === "suspended"
                      ? { borderColor: "var(--color-tinta-suave)", color: "var(--color-tinta-suave)" }
                      : { borderColor: "var(--color-propuestas)", color: "var(--color-propuestas-fuerte)" }
                  }
                >
                  {p.status === "suspended" ? "Suspendida" : "Activa"}
                </span>
                {p.episode_url && (
                  <a
                    href={p.episode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] underline underline-offset-4"
                  >
                    Escuchar
                  </a>
                )}
              </div>

              {admin && <AccionesPropuesta propuesta={p.id} estado={p.status} />}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          Aún no hay propuestas. Suma la primera.
        </p>
      )}
    </main>
  );
}
