import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { fechaLarga, hora12 } from "@/lib/fechas";
import { PantallaArchivo, type FichaArchivo } from "@/components/prototipo/PantallaArchivo";

export const metadata = { title: "Historial de Discucharlas" };

export default async function HistorialDeDiscucharlas() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  // RLS decide qué estados llegan: las borradoras solo a administración.
  const { data } = await supabase
    .from("sessions")
    .select("id, episode_title, date, start_time, place, status, image_path")
    .order("date", { ascending: false, nullsFirst: false });

  const fichas: FichaArchivo[] = (data ?? []).map((s) => ({
    id: s.id,
    titulo: s.episode_title,
    meta: [
      s.date ? capitalizar(`${fechaLarga(s.date)}${hora12(s.start_time) ? ` · ${hora12(s.start_time)}` : ""}`) : "Fecha por confirmar",
      s.place,
    ]
      .filter(Boolean)
      .join(" · "),
    estado: s.status as FichaArchivo["estado"],
    portada: s.image_path,
  }));

  return <PantallaArchivo fichas={fichas} />;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
