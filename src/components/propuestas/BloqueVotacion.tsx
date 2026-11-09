import { crearClienteServidor } from "@/lib/supabase/servidor";
import { BotonVoto } from "@/components/propuestas/BotonVoto";
import { HerramientasVotacion } from "@/components/propuestas/HerramientasVotacion";
import { resultadoEnPalabras } from "@/lib/votaciones";

/**
 * `#clubInlineVote` del prototipo v2: la votación completa vive dentro de la
 * pantalla de Propuestas, no en una ruta aparte. Trae la boleta, el resultado y
 * —para administración— el desplegable con las herramientas de la ronda.
 *
 * `/propuestas/votar` sigue existiendo como vista de pantalla completa, pero la
 * fuente de verdad visual es esta.
 */
export async function BloqueVotacion({
  usuario,
  esAdmin,
}: {
  usuario: string;
  esAdmin: boolean;
}) {
  const supabase = await crearClienteServidor();

  // Mientras no haya una abierta se muestra la última cerrada con su resultado,
  // igual que el prototipo.
  const { data: enCurso } = await supabase
    .from("voting_rounds")
    .select("*")
    .in("status", ["draft", "open"])
    .maybeSingle();

  const { data: ultima } = enCurso
    ? { data: null }
    : await supabase
        .from("voting_rounds")
        .select("*")
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const ronda = enCurso ?? ultima;
  const abierta = ronda?.status === "open";
  const borrador = ronda?.status === "draft";

  const [candidatas, resultados, misVotos, banco] = await Promise.all([
    ronda
      ? supabase.from("voting_candidates").select("proposal_id").eq("voting_round_id", ronda.id)
      : Promise.resolve({ data: [] as { proposal_id: string }[] }),
    ronda
      ? supabase.from("voting_results").select("*").eq("voting_round_id", ronda.id)
      : Promise.resolve({ data: [] as { proposal_id: string | null; vote_count: number | null }[] }),
    ronda
      ? supabase
          .from("votes")
          .select("proposal_id")
          .eq("voting_round_id", ronda.id)
          .eq("user_id", usuario)
      : Promise.resolve({ data: [] as { proposal_id: string }[] }),
    // El banco completo solo hace falta para armar la votación.
    esAdmin
      ? supabase.from("podcast_proposals").select("*").eq("status", "active").order("created_at")
      : Promise.resolve({ data: [] }),
  ]);

  const ids = (candidatas.data ?? []).map((c) => c.proposal_id);
  const { data: opciones } = ids.length
    ? await supabase.from("podcast_proposals").select("*").in("id", ids)
    : { data: [] };

  const votos = new Map(
    (resultados.data ?? []).map((r) => [r.proposal_id, Number(r.vote_count ?? 0)])
  );
  const mios = new Set((misVotos.data ?? []).map((v) => v.proposal_id));
  const titulos = new Map([
    ...(opciones ?? []).map((p) => [p.id, p.episode_title] as const),
    ...(banco.data ?? []).map((p) => [p.id, p.episode_title] as const),
  ]);
  const elegido =
    ronda?.winning_proposal_id ? titulos.get(ronda.winning_proposal_id) ?? null : null;

  const estado = !ronda
    ? "SIN VOTACIÓN"
    : abierta
      ? "VOTACIÓN ACTIVA"
      : borrador
        ? "EN PREPARACIÓN"
        : "VOTACIÓN CERRADA";

  const descripcion = !ronda
    ? "Mientras tanto, comparte episodios para la próxima selección."
    : abierta
      ? "La elección está abierta. Vota por los episodios que te gustaría escuchar."
      : borrador
        ? "Administración está preparando las opciones de la siguiente votación."
        : "La elección terminó. Consulta los resultados y el episodio elegido.";

  const ayuda = !ronda
    ? "Aún no hay una votación. Puedes explorar o agregar propuestas."
    : abierta
      ? "Puedes votar por más de una y cambiar de opinión mientras siga abierta."
      : borrador
        ? "Las opciones todavía no son definitivas."
        : "Las opciones están bloqueadas porque la votación ya se cerró.";

  return (
    <div id="clubInlineVote">
      <div id="clubVoteDetail">
        <div id="clubBallot">
          <article className="club-voting-hero">
            <span className="club-status" id="clubVotingStatus">
              {estado}
            </span>
            <h2 id="clubVotingHeadline">{ronda?.title ?? "Pronto elegiremos qué escuchar"}</h2>
            <p id="clubVotingDescription">{descripcion}</p>
            {ronda && (
              <a className="club-button" href="#clubVoteOptions" id="clubFeaturedVote">
                Ver votación ↓
              </a>
            )}
            {/* `#clubHeroAdmin` del prototipo. Allí cada botón ejecuta la
                acción; aquí lleva al desplegable que la ejecuta, para no tener
                dos formularios distintos para lo mismo. */}
            {esAdmin && (
              <div className="club-actions" data-admin-only="panel" id="clubHeroAdmin">
                {abierta && (
                  <a className="club-button secondary" href="#clubAdminTools" id="clubHeroClose">
                    Cerrar votación
                  </a>
                )}
                {(abierta || borrador) && (
                  <a className="club-button secondary" href="#clubAdminTools" id="clubHeroEdit">
                    Modificar votación actual
                  </a>
                )}
                {!ronda && (
                  <a className="club-button secondary" href="#clubAdminTools" id="clubHeroNew">
                    Crear nueva votación
                  </a>
                )}
              </div>
            )}
          </article>

          <p className="club-muted" id="clubVoteHelp">
            {ayuda}
          </p>

          <div id="clubVoteOptions">
            {opciones && opciones.length > 0 ? (
              opciones.map((p) => (
                <BotonVoto
                  key={p.id}
                  ronda={ronda!.id}
                  propuesta={p.id}
                  votada={mios.has(p.id)}
                  titulo={p.episode_title}
                  podcast={p.podcast_name}
                  resena={p.description}
                  portada={p.image_path}
                  votos={votos.get(p.id) ?? 0}
                  cerrada={!abierta}
                />
              ))
            ) : (
              <div className="club-panel club-muted">
                {ronda
                  ? "Esta votación todavía no tiene candidaturas."
                  : "Administración todavía no ha abierto una votación."}
              </div>
            )}
          </div>
        </div>

        <div className="club-head club-inline-head">
          <span id="clubRoundState">{estado}</span>
          <h1 id="clubRoundTitle">{ronda?.title ?? "¿Qué escuchamos después?"}</h1>
        </div>

        {ronda && !abierta && !borrador && (
          <div className="club-panel" id="clubWinnerPanel">
            <div className="club-kicker">RESULTADO</div>
            <p id="clubVoteLeaders">{resultadoEnPalabras(votos, titulos)}</p>
            {elegido && <h2 id="clubWinnerTitle">Episodio elegido: {elegido}</h2>}
            {ronda.override_note && <p id="clubWinnerHint">{ronda.override_note}</p>}
          </div>
        )}

        {esAdmin && (
          <HerramientasVotacion
            ronda={ronda ? { id: ronda.id, estado: ronda.status, titulo: ronda.title } : null}
            banco={(banco.data ?? []).map((p) => ({
              id: p.id,
              titulo: p.episode_title,
              podcast: p.podcast_name,
            }))}
            candidatas={ids}
            votos={votos}
            titulos={titulos}
          />
        )}
      </div>
    </div>
  );
}
