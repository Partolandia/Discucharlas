import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { fechaLarga } from "@/lib/fechas";
import { Backline } from "@/components/prototipo/Backline";
import { ProponerIntegrante } from "@/components/club/ProponerIntegrante";

export const metadata = { title: "Solicitar nuevo integrante" };

/** Los estados de una solicitud, tal como los nombra el prototipo v2. */
const ESTADO: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export default async function SolicitarIntegrante() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  // Quien propone puede consultar sus propias solicitudes y en qué van.
  const { data: mias } = await supabase
    .from("member_requests")
    .select("*")
    .eq("proposed_by", perfil.id)
    .order("created_at", { ascending: false });

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

      <p className="role-note">
        Enviar esta propuesta no crea una cuenta ni concede acceso automáticamente.
      </p>

      <section className="content-card" id="socialMyRequests">
        <h2>Mis propuestas de integrantes</h2>
        {mias && mias.length > 0 ? (
          mias.map((s) => (
            <article className="social-request" key={s.id}>
              <strong>{s.invitee_name}</strong>
              <span className="social-request-status">{ESTADO[s.status] ?? s.status}</span>
              {s.note && <p>{s.note}</p>}
              <small>{fechaLarga(s.created_at)}</small>
            </article>
          ))
        ) : (
          <p className="social-note">Aún no has enviado propuestas.</p>
        )}
      </section>

      <section className="content-card how-it-works">
        <h2>¿Cómo funciona?</h2>
        <p>
          <b>1.</b> Registras el nombre de la persona y, si quieres, el contexto.
        </p>
        <p>
          <b>2.</b> Administración recibe la solicitud en{" "}
          <i>Ingresos de integrantes → Solicitudes de ingreso</i>.
        </p>
        <p>
          <b>3.</b> Al aprobar la propuesta, administración generará un enlace único para crear la
          cuenta y te lo podrá compartir.
        </p>
      </section>
    </section>
  );
}
