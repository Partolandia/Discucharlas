import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { hora12 } from "@/lib/fechas";
import { ZONA_HORARIA_CLUB } from "@/lib/entorno";
import {
  PantallaCalendario,
  type SesionCalendario,
} from "@/components/prototipo/PantallaCalendario";

export const metadata = { title: "Calendario" };

export default async function Calendario() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  // RLS ya decide qué estados ve cada quien: las borradoras solo llegan a
  // administración.
  const { data } = await supabase
    .from("sessions")
    .select("id, episode_title, date, start_time, place, status")
    .not("date", "is", null)
    .order("date");

  const sesiones: SesionCalendario[] = (data ?? [])
    .filter((s): s is typeof s & { date: string } => Boolean(s.date))
    .map((s) => ({
      id: s.id,
      titulo: s.episode_title,
      fecha: s.date,
      hora: hora12(s.start_time),
      lugar: s.place,
      estado: s.status as SesionCalendario["estado"],
    }));

  // El mes que abre es el de la próxima discucharla; si no hay, el de hoy.
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA_CLUB }).format(new Date());
  const proxima = sesiones.find((s) => s.estado === "upcoming");

  return (
    <PantallaCalendario
      sesiones={sesiones}
      esAdmin={esAdministradora(perfil)}
      mesInicial={(proxima?.fecha ?? hoy).slice(0, 7)}
    />
  );
}
