import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { PantallaPropuestas } from "@/components/prototipo/PantallaPropuestas";
import { BloqueVotacion, rondaVigente } from "@/components/propuestas/BloqueVotacion";

export const metadata = { title: "Propuestas" };

export default async function Propuestas() {
  const supabase = await crearClienteServidor();

  // Sale antes de esperar el perfil: RLS decide igual quién ve qué, y así no
  // se encadenan dos viajes a Supabase para pintar la misma pantalla.
  const cuenta = supabase
    .from("podcast_proposals")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // La votación la pinta un componente de más abajo, pero su consulta puede
  // empezar ya: cuando le toque renderizar, la respuesta estará esperándolo.
  // El `catch` vacío es solo para que un fallo aquí no quede suelto: quien lo
  // espera de verdad es el bloque de votación y ahí sí se ve el error.
  void rondaVigente().catch(() => {});

  const perfil = await exigirIntegrante();
  const { count } = await cuenta;

  return (
    <PantallaPropuestas propuestas={count ?? 0}>
      <BloqueVotacion usuario={perfil.id} esAdmin={esAdministradora(perfil)} />
    </PantallaPropuestas>
  );
}
