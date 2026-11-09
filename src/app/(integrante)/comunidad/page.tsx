import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { hace } from "@/lib/fechas";
import { iniciales } from "@/lib/nombres";
import { PantallaComunidad, type HiloComunidad } from "@/components/prototipo/PantallaComunidad";

export const metadata = { title: "Comunidad" };

export default async function Comunidad() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const [hilos, respuestas, corazones, directorio] = await Promise.all([
    supabase
      .from("community_threads")
      .select("id, title, body, user_id, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("community_replies").select("thread_id").is("deleted_at", null),
    supabase
      .from("community_reactions")
      .select("thread_id, user_id")
      .not("thread_id", "is", null),
    directorioDelClub(),
  ]);

  const cuenta = (filas: Array<{ thread_id: string | null }> | null) => {
    const mapa = new Map<string, number>();
    for (const f of filas ?? []) {
      if (f.thread_id) mapa.set(f.thread_id, (mapa.get(f.thread_id) ?? 0) + 1);
    }
    return mapa;
  };

  const porRespuestas = cuenta(respuestas.data);
  const porCorazones = cuenta(corazones.data);
  const mios = new Set(
    (corazones.data ?? []).filter((c) => c.user_id === perfil.id).map((c) => c.thread_id)
  );

  const lista: HiloComunidad[] = (hilos.data ?? []).map((h) => {
    const autor = nombreDe(directorio, h.user_id);
    return {
      id: h.id,
      iniciales: iniciales(autor),
      cuando: hace(h.created_at),
      titulo: h.title ?? "Conversación",
      autor: autor.split(" ")[0],
      cuerpo: h.body,
      respuestas: porRespuestas.get(h.id) ?? 0,
      corazones: porCorazones.get(h.id) ?? 0,
      miCorazon: mios.has(h.id),
    };
  });

  return <PantallaComunidad hilos={lista} />;
}
