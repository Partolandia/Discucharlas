import { CascaronPublico } from "@/components/CascaronPublico";
import { FormularioAcceso } from "@/components/FormularioAcceso";
import { Aviso } from "@/components/ui/Aviso";

export const metadata = { title: "Entrar" };

const MOTIVOS: Record<string, string> = {
  suspendida: "Tu cuenta está suspendida. Escríbele a alguna administradora del club.",
  "enlace-invalido": "Ese enlace no es válido. Pide uno nuevo desde «Olvidé mi contraseña».",
  "enlace-vencido": "Ese enlace ya venció. Pide uno nuevo desde «Olvidé mi contraseña».",
};

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; motivo?: string }>;
}) {
  const { volver, motivo } = await searchParams;
  const aviso = motivo ? MOTIVOS[motivo] : undefined;

  return (
    <CascaronPublico
      titulo="Entrar al club"
      entrada="Con el correo y la contraseña que creaste al aceptar tu invitación."
    >
      <div className="space-y-5">
        {aviso && <Aviso tono="neutro">{aviso}</Aviso>}
        <FormularioAcceso volver={volver} />
      </div>
    </CascaronPublico>
  );
}
