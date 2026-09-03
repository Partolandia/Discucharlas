import "server-only";

import { crearClienteServidor } from "@/lib/supabase/servidor";
import { nombreCompleto } from "@/lib/sesion";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";
import { hora } from "@/lib/fechas";
import type { EstadoExportable, Renglon } from "@/lib/exportar-libro";

/**
 * Arma exactamente las filas que se van a descargar, para que la vista previa
 * y el archivo nunca se contradigan.
 *
 * Las notas privadas no salen aquí ni saldrán: son de su autora. Un campo que
 * nunca se registró va vacío, no inventado.
 */
export async function renglonesDelHistorial(estados: EstadoExportable[]): Promise<Renglon[]> {
  const supabase = await crearClienteServidor();

  const [sesiones, asistencia, stats, perfiles] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .in("status", estados)
      .order("date", { ascending: false, nullsFirst: false }),
    supabase.from("session_attendance").select("session_id, user_id, present").eq("present", true),
    supabase.from("session_stats").select("*"),
    supabase.from("profiles").select("id, first_name, last_name"),
  ]);

  const nombres = new Map((perfiles.data ?? []).map((p) => [p.id, nombreCompleto(p)]));
  const porSesion = new Map<string, string[]>();
  for (const a of asistencia.data ?? []) {
    const quien = nombres.get(a.user_id);
    if (!quien) continue;
    porSesion.set(a.session_id, [...(porSesion.get(a.session_id) ?? []), quien]);
  }
  const estadisticas = new Map((stats.data ?? []).map((s) => [s.session_id, s]));

  return (sesiones.data ?? []).map((s) => {
    const vinieron = (porSesion.get(s.id) ?? []).sort((a, b) => a.localeCompare(b, "es"));
    const dato = estadisticas.get(s.id);

    return {
      id: s.human_id,
      episodio: s.episode_title,
      podcast: s.podcast_name,
      fecha: s.date ?? "",
      inicio: hora(s.start_time) ?? "",
      fin: hora(s.end_time) ?? "",
      lugar: s.place ?? "",
      estado: ESTADOS_SESION[s.status as EstadoSesion].texto,
      enlace: s.episode_url ?? "",
      resumen: s.summary ?? "",
      asistentes: vinieron.join(", "),
      numeroAsistentes: vinieron.length,
      calificacion: dato?.average_rating ?? "",
      comentarios: dato?.comment_count ?? "",
    };
  });
}
