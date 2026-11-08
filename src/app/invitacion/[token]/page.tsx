import "@/estilos/prototipo-v2.css";
import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { hashear } from "@/lib/tokens";
import { FormularioInvitacion } from "@/components/FormularioInvitacion";

export const metadata = { title: "Tu invitación" };

export default async function Invitacion({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // La invitada aún no tiene cuenta, así que esto va con llave de servicio y el
  // permiso se comprueba contra el hash del token.
  const admin = crearClienteAdministrador();
  const { data: invitacion } = await admin
    .from("member_invitations")
    .select("invitee_name, status, expires_at")
    .eq("token_hash", hashear(token))
    .maybeSingle();

  const caducada = invitacion?.expires_at != null && new Date(invitacion.expires_at) <= new Date();
  const sirve = invitacion?.status === "unused" && !caducada;

  return (
    <main className="stage">
      <section className="phone" data-section="inicio">
        <section
          className="page member-invite-page active"
          id="crear-cuenta-invitacion"
          aria-label="Crear cuenta desde invitación"
        >
          <section className="member-invite-hero">
            <div className="member-invite-brand">
              <span className="member-invite-mark">D</span>
              <span>DISCUCHARLAS</span>
            </div>
            <div className="eyebrow">BIENVENIDA AL CLUB</div>
            <h1>Te invitaron a Discucharlas</h1>
            <p>
              <strong>Una integrante</strong> quiere sumarte a nuestro círculo.
            </p>
            <p>
              Discucharlas es un grupo que se reúne{" "}
              <strong>cada quince días, generalmente en viernes</strong>, para comentar a partir de
              un podcast inspirador nuestras historias, puntos de vista, ideas y preguntas que
              despiertan curiosidad.
            </p>
          </section>

          {sirve ? (
            <FormularioInvitacion token={token} nombre={invitacion.invitee_name} />
          ) : (
            <section className="member-invite-state">
              <div className="eyebrow">INVITACIÓN NO DISPONIBLE</div>
              <h2>Este enlace ya no está vigente</h2>
              <p>
                {caducada
                  ? "Caducó antes de que la usaras. Pídele una nueva a quien te invitó."
                  : "El enlace no es válido o ya se usó. Pídele uno nuevo a quien te invitó."}
              </p>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}
