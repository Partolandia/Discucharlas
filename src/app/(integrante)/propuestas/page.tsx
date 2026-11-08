import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { PantallaPropuestas } from "@/components/prototipo/PantallaPropuestas";

export const metadata = { title: "Propuestas" };

export default async function Propuestas() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const [activas, ronda] = await Promise.all([
    supabase
      .from("podcast_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("voting_rounds")
      .select("id, title, status")
      .in("status", ["open", "closed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const r = ronda.data;
  const candidaturas = r
    ? ((await supabase
        .from("voting_candidates")
        .select("id", { count: "exact", head: true })
        .eq("voting_round_id", r.id)).count ?? 0)
    : 0;

  return (
    <PantallaPropuestas
      propuestas={activas.count ?? 0}
      votacion={
        r ? { titulo: r.title ?? "¿Qué escuchamos después?", abierta: r.status === "open", candidaturas } : null
      }
      esAdmin={esAdministradora(perfil)}
    />
  );
}
