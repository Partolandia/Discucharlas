import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { PantallaGuia } from "@/components/prototipo/PantallaGuia";
import { sanearHtmlDeGuia, type SeccionGuia } from "@/lib/guia";

export const metadata = { title: "Guía del club" };

export default async function Guia() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("guide_sections").select("key, body");

  // Se vuelve a sanear al leer: lo guardado pudo escribirse antes del filtro.
  const guardadas: Partial<Record<SeccionGuia, string>> = {};
  for (const s of data ?? []) {
    if (s.body) guardadas[s.key as SeccionGuia] = sanearHtmlDeGuia(s.body);
  }

  return <PantallaGuia esAdmin={esAdministradora(perfil)} guardadas={guardadas} />;
}
