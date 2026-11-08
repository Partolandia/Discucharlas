import "@/estilos/prototipo-v2.css";
import { Cascaron } from "@/components/prototipo/Cascaron";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";

export default async function CascaronIntegrante({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await exigirIntegrante();

  return (
    <Cascaron
      nombre={perfil.first_name}
      inicial={perfil.first_name.charAt(0).toUpperCase()}
      esAdmin={esAdministradora(perfil)}
    >
      {children}
    </Cascaron>
  );
}
