import "@/estilos/prototipo.css";
import { redirect } from "next/navigation";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { accesoDeInvitada } from "@/lib/invitada";
import { PantallaGuia } from "@/components/prototipo/PantallaGuia";
import { sanearHtmlDeGuia, type SeccionGuia } from "@/lib/guia";

export const metadata = { title: "Guía del club" };

export default async function GuiaDeInvitada() {
  const idAcceso = await accesoDeInvitada();
  if (!idAcceso) redirect("/invitada");

  // La clave puede haberse revocado entre una visita y otra.
  const admin = crearClienteAdministrador();
  const { data: acceso } = await admin
    .from("guest_access")
    .select("id")
    .eq("id", idAcceso)
    .eq("status", "active")
    .maybeSingle();
  if (!acceso) redirect("/invitada?motivo=revocada");

  // La invitada ve la misma guía que el club, incluidas las ediciones de
  // administración, pero nunca sus controles.
  const { data } = await admin.from("guide_sections").select("key, body");
  const guardadas: Partial<Record<SeccionGuia, string>> = {};
  for (const s of data ?? []) {
    if (s.body) guardadas[s.key as SeccionGuia] = sanearHtmlDeGuia(s.body);
  }

  return (
    <main className="stage">
      <section className="phone" data-section="inicio">
        <PantallaGuia guardadas={guardadas} volverA="/invitada/inicio" volverTexto="Volver" />
      </section>
    </main>
  );
}
