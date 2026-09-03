import { CascaronPublico } from "@/components/CascaronPublico";
import { FormularioInvitada } from "@/components/FormularioInvitada";

export const metadata = { title: "Invitada" };

export default function Invitada() {
  return (
    <CascaronPublico
      titulo="Vienes de visita"
      entrada="Con la clave que te compartieron puedes ver la próxima discucharla y la guía del club."
    >
      <FormularioInvitada />
    </CascaronPublico>
  );
}
