import { exigirIntegrante } from "@/lib/sesion";
import { Backline } from "@/components/prototipo/Backline";
import { ProponerIntegrante } from "@/components/club/ProponerIntegrante";

export const metadata = { title: "Solicitar nuevo integrante" };

export default async function SolicitarIntegrante() {
  await exigirIntegrante();

  return (
    <section className="page active" id="solicitar-invitacion">
      <Backline a="/club" texto="Volver al Club" etiqueta="Volver al Club" />

      <header className="editorial-head proposal-head invite-head">
        <div className="eyebrow">NUEVO INTEGRANTE</div>
        <h1 className="page-title">Solicitar nuevo integrante</h1>
        <div aria-hidden="true" className="invite-head-ornament">
          <span className="dot" />
          <span className="paper" />
          <span className="stroke" />
          <span className="dash" />
        </div>
      </header>

      <p className="proposal-intro">
        Puedes proponer a una persona para sumarse al Club como Integrante. La administración
        revisará la solicitud y, si la activa, generará un enlace único para que esa persona pueda
        crear su cuenta.
      </p>

      <ProponerIntegrante />

      <section className="content-card how-it-works">
        <h2>¿Cómo funciona?</h2>
        <p>
          <b>1.</b> Registras el nombre de la persona y, si quieres, el contexto.
        </p>
        <p>
          <b>2.</b> Administración recibe la solicitud en{" "}
          <i>Integrantes e invitados → Nuevos integrantes</i>.
        </p>
        <p>
          <b>3.</b> Una vez aprobado, administración generará un link para hacértelo llegar.
        </p>
      </section>
    </section>
  );
}
