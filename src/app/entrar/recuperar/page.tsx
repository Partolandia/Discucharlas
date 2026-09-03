import { CascaronPublico } from "@/components/CascaronPublico";
import { FormularioRecuperar } from "@/components/FormularioRecuperar";

export const metadata = { title: "Recuperar contraseña" };

export default function Recuperar() {
  return (
    <CascaronPublico
      titulo="Olvidé mi contraseña"
      entrada="Te mandamos un enlace para elegir una nueva."
    >
      <FormularioRecuperar />
    </CascaronPublico>
  );
}
