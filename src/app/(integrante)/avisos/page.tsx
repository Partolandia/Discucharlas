import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { hace } from "@/lib/fechas";
import { PantallaAvisos, type Aviso } from "@/components/prototipo/PantallaAvisos";

export const metadata = { title: "Notificaciones" };

/** Marcar todo como leído al entrar sería mentira; se hace a propósito. */
async function marcarLeidos() {
  "use server";
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", perfil.id)
    .is("read_at", null);
  revalidatePath("/avisos");
  revalidatePath("/inicio");
}

/** Cada tipo de aviso lleva su collage, como en el prototipo. */
function iconoDe(tipo: string): { icono: string; alt: string } {
  if (tipo.includes("vot")) {
    return { icono: "/prototipo/23-80306f75.webp", alt: "Icono nueva votación" };
  }
  if (tipo.includes("coment") || tipo.includes("reply") || tipo.includes("comunidad")) {
    return { icono: "/prototipo/24-f9dbfb02.webp", alt: "Icono respuesta a comentario" };
  }
  return { icono: "/prototipo/22-5a8c90b5.webp", alt: "Icono próxima discucharla" };
}

export default async function Avisos() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const avisos: Aviso[] = (data ?? []).map((a) => ({
    id: a.id,
    titulo: a.title,
    detalle: [a.body, hace(a.created_at)].filter(Boolean).join(" · "),
    leido: Boolean(a.read_at),
    ...iconoDe(a.type),
  }));

  return <PantallaAvisos avisos={avisos} marcarLeidos={marcarLeidos} />;
}
