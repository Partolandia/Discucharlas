import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { salir } from "@/app/entrar/acciones";
import { iniciales } from "@/lib/nombres";
import { fechaLarga } from "@/lib/fechas";
import { Backline } from "@/components/prototipo/Backline";
import { FormularioPerfil } from "@/components/club/FormularioPerfil";

export const metadata = { title: "Mi perfil" };

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default async function MiPerfil() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();
  const nombre = [perfil.first_name, perfil.last_name].filter(Boolean).join(" ").trim();

  const [asistencia, propuestas] = await Promise.all([
    supabase
      .from("session_attendance")
      .select("session_id")
      .eq("user_id", perfil.id)
      .eq("present", true),
    supabase
      .from("podcast_proposals")
      .select("id", { count: "exact", head: true })
      .eq("proposed_by", perfil.id),
  ]);

  const ids = (asistencia.data ?? []).map((a) => a.session_id);
  const { data: asistidas } = ids.length
    ? await supabase
        .from("sessions")
        .select("id, episode_title, date")
        .in("id", ids)
        .order("date", { ascending: false })
    : { data: [] };

  const cumple =
    perfil.birthday_day && perfil.birthday_month
      ? `Cumpleaños · ${perfil.birthday_day} de ${MESES[perfil.birthday_month - 1]}`
      : null;

  return (
    <section className="page active" id="perfil">
      <Backline a="/club" texto="Volver al Club" etiqueta="Volver al Club" />

      <div className="profile-hero">
        <div className="profile-avatar">{iniciales(nombre)}</div>
        <h1>{nombre}</h1>
        {cumple && <p style={{ fontSize: "9px", color: "var(--muted)" }}>{cumple}</p>}
      </div>

      <FormularioPerfil perfil={perfil} />

      <div className="stat-grid">
        <div className="stat">
          <b>{ids.length}</b>
          <small>Discucharlas asistidas</small>
        </div>
        <div className="stat">
          <b>{propuestas.count ?? 0}</b>
          <small>Podcasts propuestos</small>
        </div>
      </div>

      <section className="content-card">
        <h2>Le interesa</h2>
        <p>
          {perfil.interests ??
            "Todavía no has escrito qué te interesa. Puedes hacerlo arriba, en Editar perfil."}
        </p>
      </section>

      <section className="content-card">
        <h2>Discucharlas a las que ha asistido</h2>
        <div>
          {asistidas && asistidas.length > 0 ? (
            asistidas.map((s) => (
              <p key={s.id}>
                <Link href={`/discucharla/${s.id}`}>{s.episode_title}</Link>
                {s.date && <small> · {fechaLarga(s.date)}</small>}
              </p>
            ))
          ) : (
            <p className="club-muted">Todavía no hay registro de asistencia.</p>
          )}
        </div>
      </section>

      <form action={salir}>
        <button className="club-back" type="submit">
          Cerrar sesión
        </button>
      </form>
    </section>
  );
}
