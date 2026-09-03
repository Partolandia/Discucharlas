import { NavegacionInferior } from "@/components/NavegacionInferior";
import { CabeceraApp } from "@/components/CabeceraApp";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";

export default async function CascaronIntegrante({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-28">
      <CabeceraApp
        nombre={perfil.first_name}
        inicial={perfil.first_name.charAt(0).toUpperCase()}
        sinLeer={count ?? 0}
        esAdmin={esAdministradora(perfil)}
      />
      {children}
      <NavegacionInferior />
    </div>
  );
}
