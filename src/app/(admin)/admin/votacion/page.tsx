import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirAdministradora } from "@/lib/sesion";
import { Backline } from "@/components/prototipo/Backline";
import { BloqueVotacion } from "@/components/propuestas/BloqueVotacion";

export const metadata = { title: "Votación" };

export default async function AdminVotacion() {
  const perfil = await exigirAdministradora();
  const supabase = await crearClienteServidor();

  const { data: cerradas } = await supabase
    .from("voting_rounds")
    .select("*")
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(5);

  return (
    <section className="page vote-screen-editorial active" id="voto" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      {/* Misma votación que ve el club en /propuestas, con el desplegable de
          administración ya abierto por contexto. */}
      <BloqueVotacion usuario={perfil.id} esAdmin />

      {cerradas && cerradas.length > 0 && (
        <section className="club-panel">
          <span className="club-kicker">VOTACIONES ANTERIORES</span>
          {cerradas.map((r) => (
            <p className="club-muted" key={r.id}>
              {r.title ?? "Votación"}
              {r.override_by && " · resuelta por administración"}
              {r.override_note && ` — ${r.override_note}`}
            </p>
          ))}
        </section>
      )}
    </section>
  );
}
