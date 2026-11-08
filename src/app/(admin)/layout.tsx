import "@/estilos/prototipo.css";
import { Cascaron } from "@/components/prototipo/Cascaron";
import { exigirAdministradora } from "@/lib/sesion";

/**
 * Administración vive dentro del mismo teléfono que el resto del club: en el
 * prototipo v2 sus pantallas son `.page` como cualquier otra, solo que con
 * `data-admin-page` para que el CSS les ponga el acento propio.
 */
export default async function CascaronAdmin({ children }: { children: React.ReactNode }) {
  const perfil = await exigirAdministradora();

  return (
    <Cascaron
      nombre={perfil.first_name}
      inicial={perfil.first_name.charAt(0).toUpperCase()}
      esAdmin
    >
      {children}
    </Cascaron>
  );
}
