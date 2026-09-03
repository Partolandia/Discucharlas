import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { Campo } from "@/components/ui/Campo";
import {
  crearRonda,
  alternarCandidata,
  abrirRonda,
  cerrarRonda,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Votación" };

export default async function AdminVotacion() {
  const supabase = await crearClienteServidor();

  const { data: ronda } = await supabase
    .from("voting_rounds")
    .select("*")
    .in("status", ["draft", "open"])
    .maybeSingle();

  const [propuestas, candidatas, resultados, cerradas, directorio] = await Promise.all([
    supabase.from("podcast_proposals").select("*").eq("status", "active").order("created_at"),
    ronda
      ? supabase.from("voting_candidates").select("proposal_id").eq("voting_round_id", ronda.id)
      : Promise.resolve({ data: [] as { proposal_id: string }[] }),
    ronda
      ? supabase.from("voting_results").select("*").eq("voting_round_id", ronda.id)
      : Promise.resolve({ data: [] as { proposal_id: string | null; vote_count: number | null }[] }),
    supabase
      .from("voting_rounds")
      .select("*")
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .limit(5),
    directorioDelClub(),
  ]);

  const elegidas = new Set((candidatas.data ?? []).map((c) => c.proposal_id));
  const votos = new Map(
    (resultados.data ?? []).map((r) => [r.proposal_id, Number(r.vote_count ?? 0)])
  );
  const maximo = Math.max(0, ...votos.values());
  const empatadas = [...votos.entries()].filter(([, n]) => n === maximo && n > 0);
  const hayEmpate = maximo > 0 && empatadas.length > 1;

  const nombrePropuesta = (id: string) =>
    propuestas.data?.find((p) => p.id === id)?.episode_title ?? "Propuesta";

  return (
    <main className="px-5 pb-8">
      <Link
        href="/admin"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a administración
      </Link>

      <h1 className="editorial mt-5 text-[1.9rem] leading-tight">Votación</h1>

      {!ronda && (
        <section className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5">
          <h2 className="editorial text-[1.3rem]">Preparar una nueva</h2>
          <p className="mt-1 mb-4 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
            Se crea en preparación: eliges las candidaturas y luego la abres.
          </p>
          <FormularioAccion accion={crearRonda} etiquetaEnvio="Crear votación">
            <Campo
              etiqueta="Título"
              name="titulo"
              maxLength={160}
              placeholder="¿Qué escuchamos después?"
            />
          </FormularioAccion>
        </section>
      )}

      {ronda && (
        <>
          <section className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5">
            <span
              className="text-[11px] font-semibold tracking-wide uppercase"
              style={{ color: "var(--color-votacion-boton)" }}
            >
              {ronda.status === "open" ? "Abierta" : "En preparación"}
            </span>
            <h2 className="editorial mt-1 text-[1.35rem] leading-tight">
              {ronda.title ?? "¿Qué escuchamos después?"}
            </h2>

            {ronda.status === "draft" && (
              <div className="mt-4">
                <BotonAccion accion={abrirRonda} campos={{ ronda: ronda.id }} tono="principal">
                  Abrir la votación
                </BotonAccion>
                <p className="mt-2 text-[13px] text-[var(--color-tinta-suave)]">
                  Hacen falta al menos dos candidaturas. Al abrirla, el club recibe aviso.
                </p>
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Candidaturas                                                      */}
          {/* ---------------------------------------------------------------- */}
          <section className="mt-7">
            <h2 className="editorial text-[1.4rem]">
              {ronda.status === "open" ? "Cómo va" : "Elige las candidaturas"}
            </h2>

            {propuestas.data && propuestas.data.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {propuestas.data
                  .filter((p) => ronda.status !== "open" || elegidas.has(p.id))
                  .map((p) => {
                    const dentro = elegidas.has(p.id);
                    const cuenta = votos.get(p.id) ?? 0;

                    return (
                      <li
                        key={p.id}
                        className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-4"
                        style={dentro ? { borderColor: "var(--color-votacion-boton)" } : undefined}
                      >
                        <h3 className="text-[16px] leading-snug font-medium">
                          {p.episode_title}
                        </h3>
                        <p className="mt-0.5 text-[14px] text-[var(--color-tinta-suave)]">
                          {p.podcast_name} · {nombreDe(directorio, p.proposed_by)}
                        </p>

                        {ronda.status === "open" ? (
                          <p className="mt-2 text-[15px]">
                            {cuenta === 0
                              ? "Sin votos"
                              : cuenta === 1
                                ? "1 voto"
                                : `${cuenta} votos`}
                            {cuenta === maximo && maximo > 0 && (
                              <span
                                className="ml-2 text-[13px] font-medium"
                                style={{ color: "var(--color-votacion-boton)" }}
                              >
                                va arriba
                              </span>
                            )}
                          </p>
                        ) : (
                          <div className="mt-3">
                            <BotonAccion
                              accion={alternarCandidata}
                              campos={{ ronda: ronda.id, propuesta: p.id }}
                              tono={dentro ? "principal" : "normal"}
                            >
                              {dentro ? "Es candidata ✓" : "Sumar a la votación"}
                            </BotonAccion>
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="mt-4 text-[15px] text-[var(--color-tinta-suave)]">
                No hay propuestas activas en el banco.
              </p>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Cierre                                                            */}
          {/* ---------------------------------------------------------------- */}
          {ronda.status === "open" && (
            <section className="mt-7 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5">
              <h2 className="editorial text-[1.3rem]">Cerrar la votación</h2>

              {hayEmpate ? (
                <p className="mt-2 mb-4 text-[15px] leading-relaxed" style={{ color: "var(--color-aviso)" }}>
                  Hay empate entre {empatadas.map(([id]) => nombrePropuesta(id!)).join(" y ")}.
                  Elige cuál gana para poder cerrar.
                </p>
              ) : (
                <p className="mt-1 mb-4 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
                  Si dejas la ganadora en blanco, gana la más votada. Elegir una distinta queda
                  registrado como decisión de administración.
                </p>
              )}

              <FormularioAccion accion={cerrarRonda} etiquetaEnvio="Cerrar votación">
                <input type="hidden" name="ronda" value={ronda.id} />
                <div className="space-y-1.5">
                  <label htmlFor="ganadora" className="block text-[15px] font-medium">
                    Ganadora
                  </label>
                  <select
                    id="ganadora"
                    name="ganadora"
                    defaultValue=""
                    className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px]"
                  >
                    <option value="">La más votada</option>
                    {[...elegidas].map((pid) => (
                      <option key={pid} value={pid}>
                        {nombrePropuesta(pid)}
                      </option>
                    ))}
                  </select>
                </div>
                <Campo
                  etiqueta="Nota (opcional)"
                  name="nota"
                  maxLength={500}
                  ayuda="Si eliges una distinta a la más votada, conviene explicar por qué."
                />
              </FormularioAccion>
            </section>
          )}
        </>
      )}

      {cerradas.data && cerradas.data.length > 0 && (
        <section className="mt-9">
          <h2 className="editorial text-[1.4rem]">Votaciones anteriores</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            {cerradas.data.map((r) => (
              <li key={r.id} className="text-[var(--color-tinta-suave)]">
                {r.title ?? "Votación"}
                {r.override_by && " · resuelta por administración"}
                {r.override_note && ` — ${r.override_note}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
