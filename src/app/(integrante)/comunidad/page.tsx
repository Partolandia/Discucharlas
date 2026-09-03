import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { EncabezadoSeccion } from "@/components/EncabezadoSeccion";
import { AbrirConversacion } from "@/components/comunidad/AbrirConversacion";
import { BotonCorazon } from "@/components/comunidad/BotonCorazon";

export const metadata = { title: "Comunidad" };

export default async function Comunidad() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const [hilos, respuestas, corazones, directorio] = await Promise.all([
    supabase
      .from("community_threads")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("community_replies").select("thread_id").is("deleted_at", null),
    supabase.from("community_reactions").select("thread_id, user_id").not("thread_id", "is", null),
    directorioDelClub(),
  ]);

  // Contamos en memoria: son pocos registros y evita una consulta por hilo.
  const porHilo = new Map<string, number>();
  for (const r of respuestas.data ?? []) {
    porHilo.set(r.thread_id, (porHilo.get(r.thread_id) ?? 0) + 1);
  }

  const corazonesPorHilo = new Map<string, number>();
  const mios = new Set<string>();
  for (const c of corazones.data ?? []) {
    if (!c.thread_id) continue;
    corazonesPorHilo.set(c.thread_id, (corazonesPorHilo.get(c.thread_id) ?? 0) + 1);
    if (c.user_id === perfil.id) mios.add(c.thread_id);
  }

  return (
    <main className="px-5 pb-8">
      <EncabezadoSeccion clave="comunidad" />

      <div className="mt-4">
        <AbrirConversacion />
      </div>

      {hilos.data && hilos.data.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {hilos.data.map((h) => {
            const autora = nombreDe(directorio, h.user_id);
            return (
              <li
                key={h.id}
                className="overflow-hidden rounded-[var(--radius-tarjeta)] bg-[var(--color-blanco)]"
                style={{ borderLeft: "4px solid var(--color-comunidad)" }}
              >
                <div className="flex gap-3 px-4 py-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
                    style={{ background: "var(--color-comunidad)" }}
                  >
                    {autora.charAt(0)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link href={`/comunidad/${h.id}`}>
                      <h2 className="text-[16px] leading-snug font-medium">
                        {h.title ?? "Conversación"}
                      </h2>
                      <p
                        className="mt-0.5 text-[13px]"
                        style={{ color: "var(--color-comunidad-fuerte)" }}
                      >
                        Abierta por {autora}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
                        {h.body}
                      </p>
                    </Link>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Link
                        href={`/comunidad/${h.id}`}
                        className="text-[13px] text-[var(--color-tinta-suave)]"
                      >
                        {porHilo.get(h.id) ?? 0}
                        {(porHilo.get(h.id) ?? 0) === 1 ? " respuesta" : " respuestas"}
                      </Link>
                      <BotonCorazon
                        hilo={h.id}
                        cuenta={corazonesPorHilo.get(h.id) ?? 0}
                        mio={mios.has(h.id)}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          Todavía no hay conversación. Puedes empezarla tú.
        </p>
      )}
    </main>
  );
}
