import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { Backline } from "@/components/prototipo/Backline";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { Campo } from "@/components/ui/Campo";
import { masVotadas, resultadoEnPalabras } from "@/lib/votaciones";
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
  const titulos = new Map((propuestas.data ?? []).map((p) => [p.id, p.episode_title]));
  const { maximo, lideres } = masVotadas(votos);
  const hayEmpate = lideres.length > 1;
  const abierta = ronda?.status === "open";

  const nombrePropuesta = (id: string) => titulos.get(id) ?? "Propuesta";

  return (
    <section className="page vote-screen-editorial active" id="voto" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      <div id="clubBallot">
        <article className="club-voting-hero">
          <span className="club-status">
            {!ronda ? "SIN VOTACIÓN" : abierta ? "VOTACIÓN ACTIVA" : "EN PREPARACIÓN"}
          </span>
          <h2>{ronda?.title ?? "¿Qué escuchamos después?"}</h2>
          <p>
            {!ronda
              ? "Todavía no hay ninguna votación. Prepara una con las propuestas del banco."
              : abierta
                ? "La votación está abierta. Aquí ves cómo va antes de cerrarla."
                : "Elige las candidaturas y ábrela cuando esté lista."}
          </p>
        </article>

        {ronda && (
          <div id="clubVoteOptions">
            {propuestas.data && propuestas.data.length > 0 ? (
              propuestas.data
                .filter((p) => !abierta || elegidas.has(p.id))
                .map((p) => {
                  const dentro = elegidas.has(p.id);
                  const cuenta = votos.get(p.id) ?? 0;

                  return (
                    <article
                      key={p.id}
                      className={`club-vote-option${dentro ? " on" : ""}`}
                    >
                      <span>
                        <strong>{p.episode_title}</strong>
                        <small>
                          {p.podcast_name} · {nombreDe(directorio, p.proposed_by)}
                        </small>
                        {abierta ? (
                          <span>
                            {cuenta === 0 ? "Sin votos" : `${cuenta} ${cuenta === 1 ? "voto" : "votos"}`}
                            {cuenta === maximo && maximo > 0 && " · va arriba"}
                          </span>
                        ) : (
                          <span className="club-actions">
                            <BotonAccion
                              accion={alternarCandidata}
                              campos={{ ronda: ronda.id, propuesta: p.id }}
                              tono={dentro ? "principal" : "normal"}
                            >
                              {dentro ? "Es candidata ✓" : "Sumar a la votación"}
                            </BotonAccion>
                          </span>
                        )}
                      </span>
                    </article>
                  );
                })
            ) : (
              <p className="club-muted">No hay propuestas activas en el banco.</p>
            )}
          </div>
        )}
      </div>

      {abierta && (
        <section className="club-panel" id="clubWinnerPanel">
          <span className="club-kicker">CÓMO VA</span>
          <p id="clubVoteLeaders">{resultadoEnPalabras(votos, titulos)}</p>
        </section>
      )}

      {/* El prototipo guarda la administración de la votación en un desplegable
          para que no coma pantalla en el celular. */}
      <details className="club-admin-tools" id="clubAdminTools" data-admin-only="panel">
        <summary>Administrar votación</summary>

        {!ronda && (
          <div id="clubRoundAdmin">
            <p className="club-muted">
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
          </div>
        )}

        {ronda?.status === "draft" && (
          <div id="clubRoundAdmin">
            <div className="club-actions">
              <BotonAccion accion={abrirRonda} campos={{ ronda: ronda.id }} tono="principal">
                Abrir la votación
              </BotonAccion>
            </div>
            <p className="club-muted">
              Hacen falta al menos dos candidaturas. Al abrirla, el club recibe aviso.
            </p>
          </div>
        )}

        {abierta && ronda && (
          <div id="clubWinnerAdmin">
            <span className="club-kicker">CERRAR LA VOTACIÓN</span>
            {hayEmpate ? (
              <p className="club-message">
                Hay empate entre {lideres.map(nombrePropuesta).join(" y ")}. Elige cuál gana para
                poder cerrar.
              </p>
            ) : (
              <p className="club-muted">
                Si dejas la ganadora en blanco, gana la más votada. Elegir una distinta queda
                registrado como decisión de administración.
              </p>
            )}

            <FormularioAccion accion={cerrarRonda} etiquetaEnvio="Cerrar votación">
              <input type="hidden" name="ronda" value={ronda.id} />
              <label className="club-label" htmlFor="ganadora">
                SELECCIÓN FINAL
              </label>
              <select className="form-input" defaultValue="" id="ganadora" name="ganadora">
                <option value="">La más votada</option>
                {[...elegidas].map((pid) => (
                  <option key={pid} value={pid}>
                    {nombrePropuesta(pid)}
                  </option>
                ))}
              </select>
              <Campo
                etiqueta="Nota (opcional)"
                name="nota"
                maxLength={500}
                ayuda="Si eliges una distinta a la más votada, conviene explicar por qué."
              />
            </FormularioAccion>
          </div>
        )}
      </details>

      {cerradas.data && cerradas.data.length > 0 && (
        <section className="club-panel">
          <span className="club-kicker">VOTACIONES ANTERIORES</span>
          {cerradas.data.map((r) => (
            <p className="club-muted" key={r.id}>
              {r.title ?? "Votación"}
              {r.override_by && " · resuelta por administración"}
              {r.override_note && ` — ${r.override_note}`}
            </p>
          ))}
        </section>
      )}
    </section>
  );
}
