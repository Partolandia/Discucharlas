import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
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
      <main className="px-5 pb-8">
        <Volver />
        <h1 className="editorial mt-6 text-[1.8rem] leading-tight">No hay votación abierta</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
          Cuando administración abra la siguiente, podrás votar desde aquí.
        </p>
      </main>
    );
  }

  const [candidatas, resultados, misVotos, directorio] = await Promise.all([
    supabase.from("voting_candidates").select("proposal_id").eq("voting_round_id", ronda.id),
    supabase.from("voting_results").select("*").eq("voting_round_id", ronda.id),
    supabase.from("votes").select("proposal_id").eq("voting_round_id", ronda.id).eq("user_id", perfil.id),
    directorioDelClub(),
  ]);

  const ids = (candidatas.data ?? []).map((c) => c.proposal_id);
  const { data: propuestas } = ids.length
    ? await supabase.from("podcast_proposals").select("*").in("id", ids)
    : { data: [] };

  const votos = new Map(
    (resultados.data ?? []).map((r) => [r.proposal_id, r.vote_count ?? 0])
  );
  const mios = new Set((misVotos.data ?? []).map((v) => v.proposal_id));
  const total = [...votos.values()].reduce((a, b) => a + Number(b), 0);

  return (
    <main className="px-5 pb-8">
      <Volver />

      <header className="mt-5">
        <p
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: "var(--color-votacion-boton)" }}
        >
          Votación activa
        </p>
        <h1 className="editorial mt-2 text-[1.9rem] leading-[1.1]">
          {ronda.title ?? "¿Qué escuchamos después?"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          Puedes votar por más de una y cambiar de opinión mientras siga abierta.
        </p>
      </header>

      {propuestas && propuestas.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {propuestas.map((p) => {
            const cuenta = Number(votos.get(p.id) ?? 0);
            const porcentaje = total > 0 ? Math.round((cuenta / total) * 100) : 0;

            return (
              <li
                key={p.id}
                className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
              >
                <h2 className="editorial text-[1.25rem] leading-snug">{p.episode_title}</h2>
                <p className="mt-0.5 text-[14px] text-[var(--color-tinta-suave)]">
                  {p.podcast_name}
                  {p.duration && ` · ${p.duration}`}
                </p>

                {p.description && (
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
                    {p.description}
                  </p>
                )}

                <p className="mt-2 text-[13px] text-[var(--color-tinta-suave)]">
                  Propuesto por {nombreDe(directorio, p.proposed_by)}
                </p>

                {/* Resultados parciales: el club decidió que sí se muestran. */}
                <div className="mt-4">
                  <div
                    className="h-2 overflow-hidden rounded-full"
                    style={{ background: "var(--color-linea)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${porcentaje}%`,
                        background: "var(--color-votacion-acento)",
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[13px] text-[var(--color-tinta-suave)]">
                    {cuenta === 0 ? "Sin votos todavía" : cuenta === 1 ? "1 voto" : `${cuenta} votos`}
                  </p>
                </div>

                <div className="mt-4">
                  <BotonVoto ronda={ronda.id} propuesta={p.id} votada={mios.has(p.id)} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          Esta votación todavía no tiene candidaturas.
        </p>
      )}
    </main>
  );
}

function Volver() {
  return (
    <Link
      href="/propuestas"
      className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
    >
      Volver a propuestas
    </Link>
  );
}
