import { exigirIntegrante } from "@/lib/sesion";
import { Backline } from "@/components/prototipo/Backline";
import { AbrirConversacion } from "@/components/comunidad/AbrirConversacion";

export const metadata = { title: "Nueva conversación" };

export default async function NuevaConversacion() {
  await exigirIntegrante();

  return (
    <section className="page active" id="nueva-conversacion">
      <Backline a="/comunidad" texto="Volver a Comunidad" etiqueta="Volver a Comunidad" />

      <header className="editorial-head community-head community-head-v1">
        <div className="eyebrow">NUEVA CONVERSACIÓN</div>
        <h1 className="page-title">¿Qué quieres compartir?</h1>
      </header>

      <p className="community-form-intro">
        Puede ser una pregunta, algo que te quedó dando vueltas, un podcast, artículo, libro o
        cualquier hallazgo para el club.
      </p>

      <AbrirConversacion />
    </section>
  );
}
