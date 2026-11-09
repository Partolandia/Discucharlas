import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { BotonVoto } from "@/components/propuestas/BotonVoto";
import { resultadoEnPalabras } from "@/lib/votaciones";

export const metadata = { title: "Votación" };

export default async function Votar() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  // Si no hay ninguna abierta se enseña la última cerrada: el prototipo deja
  // ver el resultado con las opciones bloqueadas y sus votos a la vista.
  const { data: abiertaData } = await supabase
    .from("voting_rounds")
    .select("*")
    .eq("status", "open")
    .maybeSingle();

  const { data: cerradaData } = abiertaData
    ? { data: null }
    : await supabase
        .from("voting_rounds")
        .select("*")
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const ronda = abiertaData ?? cerradaData;
  const abierta = Boolean(abiertaData);

  if (!ronda) {
    return (
      <section className="page vote-screen-editorial active" id="voto">
        <Volver />
        <div className="club-head club-inline-head">
          <span>SIN VOTACIÓN</span>
          <h1>¿Qué escuchamos después?</h1>
        </div>
        <p className="club-muted">Aún no hay una votación. Puedes explorar o agregar propuestas.</p>
        <div className="club-panel club-muted">
          Administración todavía no ha abierto una votación.
        </div>
      </section>
    );
  }

  const [candidatas, resultados, misVotos] = await Promise.all([
    supabase.from("voting_candidates").select("proposal_id").eq("voting_round_id", ronda.id),
    supabase.from("voting_results").select("*").eq("voting_round_id", ronda.id),
    supabase
      .from("votes")
      .select("proposal_id")
      .eq("voting_round_id", ronda.id)
      .eq("user_id", perfil.id),
  ]);

  const ids = (candidatas.data ?? []).map((c) => c.proposal_id);
  const { data: propuestas } = ids.length
    ? await supabase.from("podcast_proposals").select("*").in("id", ids)
    : { data: [] };

  const votos = new Map(
    (resultados.data ?? []).map((r) => [r.proposal_id, Number(r.vote_count ?? 0)])
  );
  const mios = new Set((misVotos.data ?? []).map((v) => v.proposal_id));
  const titulos = new Map((propuestas ?? []).map((p) => [p.id, p.episode_title]));
  const elegido = ronda.winning_proposal_id ? titulos.get(ronda.winning_proposal_id) : null;

  return (
    <section className="page vote-screen-editorial active" id="voto">
      <Volver />

      {/* El prototipo agrupa estado, título y opciones en un mismo fondo oscuro. */}
      <div id="clubBallot">
        <article className="club-voting-hero">
          <span className="club-status">{abierta ? "VOTACIÓN ACTIVA" : "VOTACIÓN CERRADA"}</span>
          <h2>{ronda.title ?? "¿Qué escuchamos después?"}</h2>
          <p>
            {abierta
              ? "La elección está abierta. Vota por los episodios que te gustaría escuchar."
              : "La elección terminó. Estas fueron las opciones y los votos que recibieron."}
          </p>
        </article>

        <p id="clubVoteHelp">
          {abierta
            ? "Puedes votar por más de una y cambiar de opinión mientras siga abierta."
            : "Las opciones están bloqueadas porque la votación ya se cerró."}
        </p>

        <div id="clubVoteOptions">
          {propuestas && propuestas.length > 0 ? (
            propuestas.map((p) => (
              <BotonVoto
                key={p.id}
                ronda={ronda.id}
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
            <p className="club-muted">Esta votación todavía no tiene candidaturas.</p>
          )}
        </div>
      </div>

      {/* Resultado aparte, en claro: el prototipo distingue lo más votado de la
          selección final de administración. */}
      {!abierta && (
        <section className="club-panel" id="clubWinnerPanel">
          <span className="club-kicker">RESULTADO</span>
          <p id="clubVoteLeaders">{resultadoEnPalabras(votos, titulos)}</p>
          {elegido && <p id="clubWinnerTitle">Episodio elegido: {elegido}</p>}
          {ronda.override_note && <p id="clubWinnerHint">{ronda.override_note}</p>}
        </section>
      )}
    </section>
  );
}

function Volver() {
  return (
    <Link className="club-back" href="/propuestas">
      ‹ Volver a propuestas
    </Link>
  );
}
