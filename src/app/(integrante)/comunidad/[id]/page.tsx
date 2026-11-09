import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { iniciales } from "@/lib/nombres";
import { hace } from "@/lib/fechas";
import { Backline } from "@/components/prototipo/Backline";
import { Responder } from "@/components/comunidad/Responder";
import { BotonCorazon } from "@/components/comunidad/BotonCorazon";
import { CuerpoMensaje } from "@/components/comunidad/CuerpoMensaje";

export default async function Hilo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data: hilo } = await supabase
    .from("community_threads")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!hilo) notFound();

  const [respuestas, corazones, directorio] = await Promise.all([
    supabase
      .from("community_replies")
      .select("*")
      .eq("thread_id", id)
      .is("deleted_at", null)
      .order("created_at"),
    supabase.from("community_reactions").select("thread_id, reply_id, user_id"),
    directorioDelClub(),
  ]);

  const cuenta = (clave: "thread_id" | "reply_id", valor: string) =>
    (corazones.data ?? []).filter((c) => c[clave] === valor).length;
  const esMio = (clave: "thread_id" | "reply_id", valor: string) =>
    (corazones.data ?? []).some((c) => c[clave] === valor && c.user_id === perfil.id);

  const autor = nombreDe(directorio, hilo.user_id);

  return (
    <section className="page active" id="hilo">
      <Backline a="/comunidad" texto="Volver a Comunidad" />

      <header className="thread-community-head">
        <div className="eyebrow">CONVERSACIÓN</div>
        <h1 className="thread-title">{hilo.title ?? "Conversación"}</h1>
        <small className="community-thread-author">Abierta por {autor}</small>
      </header>

      <div>
        <article className="community-thread-message">
          <span className="community-avatar">{iniciales(autor)}</span>
          <div>
            <strong>
              {autor} · {hace(hilo.created_at)}
            </strong>
            <CuerpoMensaje texto={hilo.body} />
            <BotonCorazon
              hilo={hilo.id}
              cuenta={cuenta("thread_id", hilo.id)}
              mio={esMio("thread_id", hilo.id)}
            />
          </div>
        </article>

        {(respuestas.data ?? []).map((r) => {
          const quien = nombreDe(directorio, r.user_id);
          return (
            <article key={r.id} className="community-thread-message">
              <span className="community-avatar">{iniciales(quien)}</span>
              <div>
                <strong>
                  {quien} · {hace(r.created_at)}
                </strong>
                <CuerpoMensaje texto={r.body} />
                <BotonCorazon
                  respuesta={r.id}
                  cuenta={cuenta("reply_id", r.id)}
                  mio={esMio("reply_id", r.id)}
                />
              </div>
            </article>
          );
        })}
      </div>

      <Responder hilo={id} />
    </section>
  );
}
