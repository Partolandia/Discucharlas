import "@/estilos/prototipo-v2.css";
import { redirect } from "next/navigation";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { accesoDeInvitada } from "@/lib/invitada";
import { PantallaGuia } from "@/components/prototipo/PantallaGuia";

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

  return (
    <main className="stage">
      <section className="phone" data-section="inicio">
        <PantallaGuia volverA="/invitada/inicio" volverTexto="Volver" />
      </section>
    </main>
  );
}
