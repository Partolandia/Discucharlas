import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { BotonVoto } from "@/components/propuestas/BotonVoto";

export const metadata = { title: "Votación" };

export default async function Votar() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data: ronda } = await supabase
    .from("voting_rounds")
    .select("*")
    .eq("status", "open")
    .maybeSingle();

  if (!ronda) {
    return (
      <section className="page vote-screen-editorial active" id="voto">
        <Volver />
        <div className="club-head club-inline-head">
          <span>SIN VOTACIÓN</span>
          <h1>¿Qué escuchamos después?</h1>
        </div>
        <p className="club-muted">
          Aún no hay una votación. Puedes explorar o agregar propuestas.
        </p>
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

  const votos = new Map((resultados.data ?? []).map((r) => [r.proposal_id, Number(r.vote_count ?? 0)]));
  const mios = new Set((misVotos.data ?? []).map((v) => v.proposal_id));

  return (
    <section className="page vote-screen-editorial active" id="voto">
      <Volver />
      <div className="club-head club-inline-head">
        <span>VOTACIÓN ABIERTA</span>
        <h1>{ronda.title ?? "¿Qué escuchamos después?"}</h1>
      </div>
      <p className="club-muted">
        Puedes votar por más de una y cambiar de opinión mientras siga abierta.
      </p>

      <div>
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
            />
          ))
        ) : (
          <div className="club-panel club-muted">
            Esta votación todavía no tiene candidaturas.
          </div>
        )}
      </div>
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
