import { crearClienteAdministrador } from "@/lib/supabase/administrador";
import { hashear } from "@/lib/tokens";
import { CascaronPublico } from "@/components/CascaronPublico";
import { FormularioInvitacion } from "@/components/FormularioInvitacion";
import { Aviso } from "@/components/ui/Aviso";

export const metadata = { title: "Tu invitación" };

export default async function Invitacion({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // La invitada aún no tiene cuenta, así que esto va con llave de servicio y el
  // permiso se comprueba contra el hash del token.
  const admin = crearClienteAdministrador();
  const { data: invitacion } = await admin
    .from("member_invitations")
    .select("invitee_name, status, expires_at")
    .eq("token_hash", hashear(token))
    .maybeSingle();

  const caducada =
    invitacion?.expires_at != null && new Date(invitacion.expires_at) <= new Date();
  const sirve = invitacion?.status === "unused" && !caducada;

  if (!sirve) {
    return (
      <CascaronPublico titulo="Esta invitación ya no sirve">
        <Aviso tono="neutro">
          {caducada
            ? "Caducó antes de que la usaras. Pídele una nueva a quien te invitó."
            : "El enlace no es válido o ya se usó. Pídele uno nuevo a quien te invitó."}
        </Aviso>
      </CascaronPublico>
    );
  }

  return (
    <CascaronPublico
      titulo={`Te esperamos, ${invitacion.invitee_name.split(" ")[0]}`}
      entrada="Elige una contraseña y quedas dentro del club."
    >
      <FormularioInvitacion token={token} nombre={invitacion.invitee_name} />
    </CascaronPublico>
  );
}
