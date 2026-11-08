import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaLarga } from "@/lib/fechas";
import { PantallaAdmin } from "@/components/prototipo/PantallaAdmin";

export const metadata = { title: "Administración" };

export default async function PanelAdmin() {
  const supabase = await crearClienteServidor();

  const [proxima, ronda, solicitudes, borradores] = await Promise.all([
    supabase.from("sessions").select("*").eq("status", "upcoming").maybeSingle(),
    supabase.from("voting_rounds").select("*").in("status", ["draft", "open"]).maybeSingle(),
    supabase
      .from("member_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "draft"),
  ]);

  const resumen = (
    <section className="content-card">
      <span className="mini-kicker">CÓMO VA EL CLUB</span>
      <div className="admin-history-compact-meta">
        <Dato etiqueta="Próxima discucharla">
          {proxima.data
            ? `${proxima.data.episode_title}${proxima.data.date ? ` · ${fechaLarga(proxima.data.date)}` : ""}`
            : "Sin agendar"}
        </Dato>
        <Dato etiqueta="Votación">
          {ronda.data ? (ronda.data.status === "open" ? "Abierta" : "En preparación") : "Ninguna"}
        </Dato>
        <Dato etiqueta="Solicitudes de integrante">
          {solicitudes.count ? `${solicitudes.count} por revisar` : "Ninguna pendiente"}
        </Dato>
        <Dato etiqueta="Borradores">
          {borradores.count ? `${borradores.count} sin publicar` : "Ninguno"}
        </Dato>
      </div>
    </section>
  );

  return <PantallaAdmin resumen={resumen} />;
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="admin-history-meta-item">
      <b>{etiqueta}</b>
      <span>{children}</span>
    </div>
  );
}
