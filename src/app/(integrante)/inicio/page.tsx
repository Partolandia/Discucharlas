import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { fechaLarga, hora12, hace } from "@/lib/fechas";
import { iniciales } from "@/lib/nombres";
import { PantallaInicio, type HiloResumen } from "@/components/prototipo/PantallaInicio";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const supabase = await crearClienteServidor();

  const [proxima, realizadas, propuestas, ronda, hilos, respuestas, directorio] = await Promise.all([
    supabase.from("sessions").select("*").eq("status", "upcoming").maybeSingle(),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "past"),
    supabase
      .from("podcast_proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("voting_rounds").select("id").eq("status", "open").maybeSingle(),
    supabase
      .from("community_threads")
      .select("id, title, body, user_id, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase.from("community_replies").select("thread_id").is("deleted_at", null),
    directorioDelClub(),
  ]);

  const s = proxima.data;

  const porHilo = new Map<string, number>();
  for (const r of respuestas.data ?? []) {
    porHilo.set(r.thread_id, (porHilo.get(r.thread_id) ?? 0) + 1);
  }

  const resumenHilos: HiloResumen[] = (hilos.data ?? []).map((h) => {
    const n = porHilo.get(h.id) ?? 0;
    return {
      id: h.id,
      titulo: h.title ?? "Conversación",
      cuerpo: h.body ?? "",
      iniciales: iniciales(nombreDe(directorio, h.user_id)),
      pie: `${n} ${n === 1 ? "respuesta" : "respuestas"} · ${hace(h.created_at)}`,
    };
  });

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
            }
          : null
      }
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
