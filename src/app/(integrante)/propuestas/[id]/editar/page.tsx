import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { ProponerPodcast } from "@/components/propuestas/ProponerPodcast";

export const metadata = { title: "Editar propuesta" };

export default async function EditarPropuesta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data } = await supabase.from("podcast_proposals").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  // La acción vuelve a comprobarlo; esto es para no mostrar un formulario
  // que no se va a poder guardar.
  const suya = data.proposed_by === perfil.id;
  if (!esAdministradora(perfil) && !(suya && data.status === "active")) notFound();

  return (
    <section className="page active" id="proponer">
      <Link className="club-back" href="/propuestas/lista">
        ‹ Volver a propuestas
      </Link>
      <div className="club-head">
        <span>EL PRÓXIMO EPISODIO</span>
        <h1>Editar propuesta</h1>
      </div>
      <ProponerPodcast
        propuesta={{
          id: data.id,
          episodio: data.episode_title,
          podcast: data.podcast_name,
          url: data.episode_url,
          duracion: data.duration,
          descripcion: data.description,
          portada: data.image_path,
        }}
      />
    </section>
  );
}
