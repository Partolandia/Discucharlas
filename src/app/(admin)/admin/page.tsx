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
      <div className="club-member-row">
        <b>Próxima discucharla</b>
        <small>
          {proxima.data
            ? `${proxima.data.episode_title}${proxima.data.date ? ` · ${fechaLarga(proxima.data.date)}` : ""}`
            : "Sin agendar"}
        </small>
      </div>
      <div className="club-member-row">
        <b>Votación</b>
        <small>
          {ronda.data
            ? ronda.data.status === "open"
              ? "Abierta"
              : "En preparación"
            : "Ninguna"}
        </small>
      </div>
      <div className="club-member-row">
        <b>Solicitudes de integrante</b>
        <small>{solicitudes.count ? `${solicitudes.count} por revisar` : "Ninguna pendiente"}</small>
      </div>
      <div className="club-member-row">
        <b>Borradores</b>
        <small>{borradores.count ? `${borradores.count} sin publicar` : "Ninguno"}</small>
      </div>
    </section>
  );

  return <PantallaAdmin resumen={resumen} />;
}
