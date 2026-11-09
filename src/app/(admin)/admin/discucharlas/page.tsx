import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaCorta, hora } from "@/lib/fechas";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { PortadaDiscucharla } from "@/components/admin/PortadaDiscucharla";
import {
  crearDiscucharla,
  activarDiscucharla,
  cambiarEstadoDiscucharla,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Crear Discucharla" };

export default async function AdminDiscucharlas() {
  const supabase = await crearClienteServidor();
  const { data: sesiones } = await supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <section className="page active" id="crear" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      <header className="editorial-head calendar-head admin-editorial-head create-editorial-head header-with-admin-art">
        <div className="editorial-head-copy">
          <div className="eyebrow">ADMINISTRACIÓN · NUEVA FICHA</div>
          <h1 className="page-title">Crear Discucharla</h1>
          <p>Define la sesión y decide cuándo entra al circuito del club.</p>
        </div>
        <div className="editorial-head-admin-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGENES.adminCrear} alt="Crear" />
        </div>
      </header>

      <div className="create-status-note">
        <span>01</span>
        <div>
          <b>Contenido de la sesión</b>
          <small>
            Estos datos alimentan Inicio, Calendario, la ficha y Historial de Discucharlas.
          </small>
        </div>
      </div>

      <FormularioAccion
        accion={crearDiscucharla}
        avisoAlPie
        clase="new create-save-primary"
        etiquetaEnvio="Guardar ficha"
        id="saveSessionBtn"
      >
        <div className="form-card create-form-card">
          <div className="create-field">
            <label htmlFor="createTitle">TÍTULO DEL EPISODIO</label>
            <input
              className="form-input"
              id="createTitle"
              name="episodio"
              required
              maxLength={200}
              placeholder="Puedes completarlo después si es un borrador"
            />
          </div>
          <div className="create-field">
            <label htmlFor="createPodcast">NOMBRE DEL PODCAST · OPCIONAL</label>
            <input
              className="form-input"
              id="createPodcast"
              name="podcast"
              maxLength={200}
              placeholder="Opcional"
            />
          </div>
          <div className="create-field">
            <label htmlFor="createLink">ENLACE DEL EPISODIO · OPCIONAL</label>
            <input
              className="form-input"
              id="createLink"
              name="url"
              type="url"
              placeholder="Opcional · https://…"
            />
          </div>
          <div className="create-field">
            <label htmlFor="resumen">RESUMEN · OPCIONAL</label>
            <textarea className="form-input" id="resumen" name="resumen" rows={3} maxLength={4000} />
          </div>
          <PortadaDiscucharla />
        </div>

        <div className="create-status-note create-status-note-second">
          <span>02</span>
          <div>
            <b>Encuentro y estado</b>
            <small>“Próxima” la convierte en la sesión activa que aparece en Inicio.</small>
          </div>
        </div>

        <div className="form-card create-form-card create-form-card-compact">
          <div className="create-field">
            <label htmlFor="createDate">FECHA Y HORA</label>
            <input className="form-input" id="createDate" name="fecha" type="date" />
            <p className="cloud-date-hint">Fecha y hora de Ciudad de México.</p>
          </div>
          <div className="create-field">
            <label htmlFor="inicio">EMPIEZA</label>
            <input className="form-input" id="inicio" name="inicio" type="time" />
          </div>
          <div className="create-field">
            <label htmlFor="fin">TERMINA</label>
            <input className="form-input" id="fin" name="fin" type="time" />
          </div>
          <div className="create-field">
            <label htmlFor="createPlace">LUGAR</label>
            <input
              className="form-input"
              id="createPlace"
              name="lugar"
              maxLength={200}
              placeholder="Opcional"
            />
          </div>
          <div className="create-field">
            <label htmlFor="createState">ESTADO</label>
            <select className="form-input" defaultValue="draft" id="createState" name="estado">
              <option value="draft">Borrador</option>
              <option value="upcoming">Próxima</option>
              <option value="past">Realizada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <small className="field-help" id="createStateHelp">
              Borrador: solo administración puede verla.
            </small>
          </div>
        </div>

        <p className="cloud-date-hint">
          Puedes guardar un borrador incompleto y terminarlo después. Podcast, enlace, imagen y
          lugar son opcionales.
        </p>
      </FormularioAccion>

      <div className="create-status-note">
        <span>03</span>
        <div>
          <b>Todas las fichas</b>
          <small>Solo puede haber una próxima a la vez.</small>
        </div>
      </div>

      <div>
        {sesiones && sesiones.length > 0 ? (
          sesiones.map((s) => {
            const identidad = ESTADOS_SESION[s.status as EstadoSesion];
            return (
              <div key={s.id} className="member-admin-row">
                <div>
                  <small style={{ color: identidad.color }}>
                    {identidad.texto} · {s.human_id}
                  </small>
                  <b>{s.episode_title}</b>
                  <small>
                    {[s.podcast_name, s.date && fechaCorta(s.date), hora(s.start_time), s.place]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </div>
                <div className="member-admin-actions">
                  {s.status !== "upcoming" && s.status !== "past" && (
                    <BotonAccion
                      accion={activarDiscucharla}
                      campos={{ sesion: s.id }}
                      tono="principal"
                    >
                      Activar como próxima
                    </BotonAccion>
                  )}

                  {s.status === "upcoming" && (
                    <>
                      <BotonAccion
                        accion={cambiarEstadoDiscucharla}
                        campos={{ sesion: s.id, estado: "past" }}
                      >
                        Marcar realizada
                      </BotonAccion>
                      <BotonAccion
                        accion={cambiarEstadoDiscucharla}
                        campos={{ sesion: s.id, estado: "cancelled" }}
                        tono="delicado"
                        confirmacion="Se cancela la discucharla. Su ficha se conserva, pero deja de pedir asistencia y aportes."
                      >
                        Cancelar
                      </BotonAccion>
                    </>
                  )}

                  {(s.status === "past" || s.status === "upcoming") && (
                    <Link className="mini-btn" href={`/admin/discucharlas/${s.id}`}>
                      Asistencia y aportes
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="club-muted">Todavía no hay ninguna. Crea la primera arriba.</p>
        )}
      </div>
    </section>
  );
}
