import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { fechaLarga } from "@/lib/fechas";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import {
  emitirInvitacion,
  revocarInvitacion,
  generarClaveDeInvitadas,
  revocarClaveDeInvitadas,
  rechazarSolicitud,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Accesos" };

/** Las clases de `.access-status` que trae el prototipo. */
const ESTADO_INVITACION: Record<string, { texto: string; clase: string }> = {
  unused: { texto: "SIN USAR", clase: "unused" },
  used: { texto: "USADA", clase: "used" },
  revoked: { texto: "REVOCADA", clase: "revoked" },
  expired: { texto: "CADUCADA", clase: "revoked" },
};

export default async function AdminAccesos() {
  const supabase = await crearClienteServidor();

  const [solicitudes, invitaciones, clave, directorio] = await Promise.all([
    supabase
      .from("member_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("invitation_status").select("*").order("created_at", { ascending: false }),
    supabase.from("guest_access").select("*").eq("status", "active").maybeSingle(),
    directorioDelClub(),
  ]);

  return (
    <section className="page active" id="accesos" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      <header className="editorial-head proposal-head admin-editorial-head header-with-admin-art">
        <div className="editorial-head-copy">
          <div className="eyebrow">ADMINISTRACIÓN</div>
          <h1 className="page-title">Integrantes e invitados</h1>
        </div>
        <div className="editorial-head-admin-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGENES.adminAccesos} alt="Accesos" />
        </div>
      </header>

      <div className="access-section-label">NUEVOS INTEGRANTES</div>

      <section className="content-card">
        <h2>Solicitudes de ingreso</h2>
        <p className="proposal-intro" style={{ margin: "4px 0 10px" }}>
          Aquí aparecen las solicitudes enviadas por Integrantes para sumar a una nueva persona al
          Club. Al activar una solicitud, se genera un enlace único para que esa persona pueda crear
          su cuenta como Integrante.
        </p>
        <div>
          {solicitudes.data && solicitudes.data.length > 0 ? (
            solicitudes.data.map((s) => (
              <div key={s.id} className="invite-row">
                <div>
                  <b>{s.invitee_name}</b>
                  <div className="invite-request-meta">
                    Solicitó: {nombreDe(directorio, s.proposed_by)}
                    {s.invitee_email && ` · ${s.invitee_email}`}
                    {s.note && (
                      <>
                        <br />
                        {s.note}
                      </>
                    )}
                  </div>
                  <div className="access-status-row">
                    <span className="access-status pending">PENDIENTE</span>
                  </div>
                  <FormularioAccion accion={emitirInvitacion} etiquetaEnvio="Activar invitación">
                    <input type="hidden" name="solicitud" value={s.id} />
                    <label htmlFor={`nombre-${s.id}`}>NOMBRE</label>
                    <input
                      id={`nombre-${s.id}`}
                      name="nombre"
                      defaultValue={s.invitee_name}
                      required
                    />
                    <label htmlFor={`email-${s.id}`}>CORREO</label>
                    <input
                      id={`email-${s.id}`}
                      name="email"
                      type="email"
                      defaultValue={s.invitee_email ?? ""}
                      required
                    />
                  </FormularioAccion>
                </div>
                <div className="request-actions">
                  <BotonAccion
                    accion={rechazarSolicitud}
                    campos={{ solicitud: s.id }}
                    tono="delicado"
                    confirmacion="La propuesta se marca como rechazada. Quien la hizo no recibe aviso."
                  >
                    Rechazar
                  </BotonAccion>
                </div>
              </div>
            ))
          ) : (
            <p className="club-muted">No hay solicitudes pendientes.</p>
          )}
        </div>
      </section>

      <FormularioAccion accion={emitirInvitacion} etiquetaEnvio="＋ Crear invitación">
        <label htmlFor="nombre">CREAR INVITACIÓN DE INTEGRANTE</label>
        <p className="access-helper">
          Genera directamente un enlace único para una persona, sin necesidad de una solicitud
          previa. El enlace se muestra una sola vez.
        </p>
        <input id="nombre" name="nombre" required maxLength={120} placeholder="Nombre de la persona" />
        <input name="email" type="email" required placeholder="Correo de la persona" />
      </FormularioAccion>

      <section className="content-card admin-generated-invites">
        <h2>INVITACIONES CREADAS POR ADMINISTRACIÓN</h2>
        <div>
          {invitaciones.data && invitaciones.data.length > 0 ? (
            invitaciones.data.map((i) => {
              const estado = ESTADO_INVITACION[i.effective_status ?? "unused"];
              return (
                <div key={i.id} className="invite-row">
                  <div>
                    <b>Invitación para {i.invitee_name}</b>
                    <small>{i.invitee_email}</small>
                    {i.expires_at && i.effective_status === "unused" && (
                      <small>Caduca el {fechaLarga(i.expires_at)}</small>
                    )}
                    <div className="access-status-row">
                      <span className={`access-status ${estado.clase}`}>{estado.texto}</span>
                    </div>
                  </div>
                  <div className="invite-actions">
                    {i.effective_status === "unused" && i.id && (
                      <BotonAccion
                        accion={revocarInvitacion}
                        campos={{ invitacion: i.id }}
                        tono="delicado"
                        confirmacion="El enlace deja de servir en este momento."
                      >
                        Desactivar
                      </BotonAccion>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="club-muted">Todavía no has creado invitaciones.</p>
          )}
        </div>
      </section>

      <div className="access-section-label access-section-label-guests">INVITADOS</div>

      <section className="content-card guest-code-card">
        <h2>Acceso para invitados</h2>
        <p className="proposal-intro" style={{ margin: "4px 0 10px" }}>
          Con esta clave, alguien de fuera ve la próxima Discucharla y la guía del club sin crear
          una cuenta. Nada más: ni comunidad, ni perfiles, ni historial.
        </p>

        {clave.data ? (
          <>
            <div className="guest-code-current">
              <span>Clave vigente</span>
              <b>
                {clave.data.label ?? "Sin etiqueta"} · creada el {fechaLarga(clave.data.created_at)}
              </b>
            </div>
            <p className="club-muted">
              La clave no se puede volver a mostrar. Si se perdió, genera una nueva.
            </p>
            <div className="guest-code-actions">
              <BotonAccion
                accion={revocarClaveDeInvitadas}
                campos={{ clave: clave.data.id }}
                tono="delicado"
                confirmacion="Quien tenga esa clave dejará de entrar en este momento."
              >
                Desactivar clave
              </BotonAccion>
            </div>
          </>
        ) : (
          <p className="club-muted">No hay ninguna clave activa.</p>
        )}

        <FormularioAccion accion={generarClaveDeInvitadas} etiquetaEnvio="Generar clave nueva">
          <label htmlFor="etiqueta">GENERAR UNA CLAVE NUEVA</label>
          <p className="access-helper">
            Al generar una nueva, la anterior deja de servir de inmediato.
          </p>
          <input id="etiqueta" name="etiqueta" maxLength={120} placeholder="Sesión de octubre" />
        </FormularioAccion>
      </section>
    </section>
  );
}
