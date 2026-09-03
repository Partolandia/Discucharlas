import { CascaronPublico } from "@/components/CascaronPublico";
import { FormularioNuevaContrasena } from "@/components/FormularioNuevaContrasena";

export const metadata = { title: "Contraseña nueva" };

export default function NuevaContrasena() {
  return (
    <CascaronPublico titulo="Elige tu contraseña" entrada="Y te llevamos de vuelta al club.">
      <FormularioNuevaContrasena />
    </CascaronPublico>
  );
}
