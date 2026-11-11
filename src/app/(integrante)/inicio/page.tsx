import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { fechaLarga, hora12 } from "@/lib/fechas";
import { PantallaInicio, type HiloResumen } from "@/components/prototipo/PantallaInicio";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const supabase = await crearClienteServidor();

  /*
   * Las consultas salen antes de esperar el perfil en vez de después: cada
   * viaje a Supabase es ~100 ms y encadenarlos se notaba en cada navegación.
   * No abre ninguna puerta —RLS sigue decidiendo qué devuelve cada consulta y
   * el portero de abajo sigue mandando a entrar a quien no deba estar aquí.
   */
  const datos = Promise.all([
    supabase.from("sessions").select("*").eq("status", "upcoming").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "past"),
    supabase
      .from("podcast_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("voting_rounds").select("id").eq("status", "open").maybeSingle(),
    supabase
      .from("community_threads")
      .select("id, title, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase.from("community_replies").select("thread_id").is("deleted_at", null),
  ]);

  const perfil = await exigirIntegrante();
  const [proxima, realizadas, propuestas, ronda, hilos, respuestas] = await datos;

  const s = proxima.data;

  const porHilo = new Map<string, number>();
  for (const r of respuestas.data ?? []) {
    porHilo.set(r.thread_id, (porHilo.get(r.thread_id) ?? 0) + 1);
  }

  const resumenHilos: HiloResumen[] = (hilos.data ?? []).map((h) => ({
    id: h.id,
    titulo: h.title ?? "Conversación",
    respuestas: porHilo.get(h.id) ?? 0,
  }));

  return (
    <PantallaInicio
      sesion={
        s
          ? {
              id: s.id,
              titulo: s.episode_title,
              meta: [
                [s.date && capitalizar(fechaLarga(s.date)), hora12(s.start_time)]
                  .filter(Boolean)
                  .join(" · "),
                s.place,
              ].filter((linea): linea is string => Boolean(linea)),
              enlace: s.episode_url,
              portada: s.image_path,
              encuadre: { x: s.focus_x, y: s.focus_y },
            }
          : null
      }
      esAdmin={esAdministradora(perfil)}
      realizadas={realizadas.count ?? 0}
      propuestas={propuestas.count ?? 0}
      votacionAbierta={Boolean(ronda.data)}
      hilos={resumenHilos}
    />
  );
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
