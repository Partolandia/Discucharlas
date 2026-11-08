import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { PantallaHistorialVotaciones } from "@/components/prototipo/PantallaHistorialVotaciones";

export const metadata = { title: "Historial de votaciones" };

export default async function HistorialDeVotaciones() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data: rondas } = await supabase
    .from("voting_rounds")
    .select("id, title, closed_at, created_at, winning_proposal_id")
    .eq("status", "closed")
    .order("closed_at", { ascending: false });

  const ganadoras = (rondas ?? [])
    .map((r) => r.winning_proposal_id)
    .filter((id): id is string => Boolean(id));

  const { data: propuestas } = ganadoras.length
    ? await supabase.from("podcast_proposals").select("id, episode_title").in("id", ganadoras)
    : { data: [] };

  const titulos = new Map((propuestas ?? []).map((p) => [p.id, p.episode_title]));

  return (
    <PantallaHistorialVotaciones
      rondas={(rondas ?? []).map((r) => ({
        id: r.id,
        titulo: r.title ?? "¿Qué escuchamos después?",
        cerrada: new Intl.DateTimeFormat("es-MX").format(
          new Date(r.closed_at ?? r.created_at),
        ),
        ganador: (r.winning_proposal_id && titulos.get(r.winning_proposal_id)) || "Por confirmar",
      }))}
    />
  );
}
