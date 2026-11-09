import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { PantallaPropuestas } from "@/components/prototipo/PantallaPropuestas";
import { BloqueVotacion } from "@/components/propuestas/BloqueVotacion";

export const metadata = { title: "Propuestas" };

export default async function Propuestas() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { count } = await supabase
    .from("podcast_proposals")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <PantallaPropuestas propuestas={count ?? 0}>
      <BloqueVotacion usuario={perfil.id} esAdmin={esAdministradora(perfil)} />
    </PantallaPropuestas>
  );
}
