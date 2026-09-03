import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { Responder } from "@/components/comunidad/Responder";
import { BotonCorazon } from "@/components/comunidad/BotonCorazon";

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

  return (
    <main className="px-5 pb-8">
      <Link
        href="/comunidad"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a comunidad
      </Link>

      <article className="mt-5">
        <h1 className="editorial text-[1.8rem] leading-[1.12]">
          {hilo.title ?? "Conversación"}
        </h1>
        <p className="mt-1.5 text-[14px]" style={{ color: "var(--color-comunidad-fuerte)" }}>
          Abierta por {nombreDe(directorio, hilo.user_id)}
        </p>
        <p className="mt-4 text-[16px] leading-relaxed whitespace-pre-line">{hilo.body}</p>
        <div className="mt-4">
          <BotonCorazon
            hilo={hilo.id}
            cuenta={cuenta("thread_id", hilo.id)}
            mio={esMio("thread_id", hilo.id)}
          />
        </div>
      </article>

      <section className="mt-9">
        <h2 className="editorial text-[1.4rem]">
          {respuestas.data?.length
            ? `${respuestas.data.length} ${respuestas.data.length === 1 ? "respuesta" : "respuestas"}`
            : "Sin respuestas todavía"}
        </h2>

        {respuestas.data && respuestas.data.length > 0 && (
          <ul className="mt-4 space-y-3">
            {respuestas.data.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-tarjeta)] bg-[var(--color-blanco)] px-5 py-4"
                style={{ borderLeft: "3px solid var(--color-comunidad-suave)" }}
              >
                <p className="text-[13px]" style={{ color: "var(--color-comunidad-fuerte)" }}>
                  {nombreDe(directorio, r.user_id)}
                </p>
                <p className="mt-1.5 text-[16px] leading-relaxed whitespace-pre-line">{r.body}</p>
                <div className="mt-3">
                  <BotonCorazon
                    respuesta={r.id}
                    cuenta={cuenta("reply_id", r.id)}
                    mio={esMio("reply_id", r.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5">
          <Responder hilo={id} />
        </div>
      </section>
    </main>
  );
}
