import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub } from "@/lib/club";
import { iniciales, acentoDe } from "@/lib/nombres";
import { PantallaClub, type IntegranteFila } from "@/components/prototipo/PantallaClub";

export const metadata = { title: "Club" };

export default async function Club() {
  const supabase = await crearClienteServidor();

  // Las consultas salen antes de esperar el perfil: lo que ven sigue
  // decidiéndolo RLS, y así la pantalla no paga dos viajes seguidos.
  const datos = Promise.all([
    directorioDelClub(),
    supabase.from("session_attendance").select("user_id").eq("present", true),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "past"),
  ]);

  const perfil = await exigirIntegrante();
  const [directorio, asistencias, realizadas] = await datos;

  const porPersona = new Map<string, number>();
  for (const a of asistencias.data ?? []) {
    porPersona.set(a.user_id, (porPersona.get(a.user_id) ?? 0) + 1);
  }

  const activos = [...directorio.values()].filter((i) => i.status === "active");

  // Quien mira va primero, como en el prototipo; el resto por nombre.
  activos.sort((a, b) => {
    if (a.id === perfil.id) return -1;
    if (b.id === perfil.id) return 1;
    return (a.first_name ?? "").localeCompare(b.first_name ?? "", "es");
  });

  const integrantes: IntegranteFila[] = activos.map((i) => {
    const nombre = [i.first_name, i.last_name].filter(Boolean).join(" ").trim() || "Integrante";
    const esMio = i.id === perfil.id;
    const esAdmin = i.role === "admin";
    const vino = porPersona.get(i.id) ?? 0;

    return {
      id: i.id,
      nombre: i.first_name ?? nombre,
      iniciales: iniciales(nombre),
      acento: acentoDe(i.id),
      epigrafe: esMio
        ? esAdmin
          ? "TU PERFIL · ADMINISTRADOR"
          : "TU PERFIL"
        : esAdmin
          ? "ADMINISTRADOR"
          : "INTEGRANTE",
      detalle: esMio
        ? "Ver y editar perfil"
        : `${vino} ${vino === 1 ? "Discucharla" : "Discucharlas"} · Ver perfil`,
      esMio,
    };
  });

  return (
    <PantallaClub
      integrantes={integrantes}
      realizadas={realizadas.count ?? 0}
      rutaProponer="/club/proponer"
    />
  );
}
