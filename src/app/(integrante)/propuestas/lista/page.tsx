import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
import {
  PantallaPropuestasLista,
  type PropuestaFila,
} from "@/components/prototipo/PantallaPropuestasLista";

export const metadata = { title: "Propuestas" };

export default async function ListaDePropuestas() {
  const perfil = await exigirIntegrante();
  const admin = esAdministradora(perfil);
  const supabase = await crearClienteServidor();

  const [propuestas, directorio] = await Promise.all([
    supabase
      .from("podcast_proposals")
      .select("*")
      .in("status", admin ? ["active", "suspended"] : ["active"])
      .order("created_at", { ascending: false }),
    directorioDelClub(),
  ]);

  const filas: PropuestaFila[] = (propuestas.data ?? []).map((p) => ({
    id: p.id,
    titulo: p.episode_title,
    podcast: p.podcast_name,
    duracion: p.duration,
    resena: p.description,
    autor: nombreDe(directorio, p.proposed_by),
    enlace: p.episode_url,
    suspendida: p.status === "suspended",
  }));

  return <PantallaPropuestasLista propuestas={filas} />;
}
