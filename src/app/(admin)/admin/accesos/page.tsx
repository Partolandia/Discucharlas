import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { fechaCorta, fechaHoraCorta, fechaLarga } from "@/lib/fechas";
import { urlDelSitio } from "@/lib/entorno";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { ActualizarIngresos } from "@/components/admin/ActualizarIngresos";
import {
  TarjetaIngreso,
  ControlesDeIngreso,
  type Ingreso,
} from "@/components/admin/TarjetaIngreso";
import { ClaveDeInvitadas } from "@/components/admin/ClaveDeInvitadas";
import {
  emitirInvitacion,
  revocarClaveDeInvitadas,
  rechazarSolicitud,
  reabrirSolicitud,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Accesos" };

const ESTADO_SOLICITUD: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

/** Los estados que el prototipo pinta en `.entry-state`. */
const ESTADO_INGRESO: Record<string, Ingreso["estado"]> = {
  unused: "active",
  used: "used",
  revoked: "revoked",
  expired: "expired",
};

function detalleIngreso(estado: string | null, usado: string | null, caduca: string | null): string {
  if (estado === "used") return usado ? `Cuenta creada el ${fechaLarga(usado)}` : "Cuenta creada";
  if (estado === "unused" && caduca) return `Vence el ${fechaCorta(caduca)}`;
  return "Puedes generar un enlace nuevo";
}

export default async function AdminAccesos() {
  const supabase = await crearClienteServidor();

  const [solicitudes, invitaciones, clave, directorio] = await Promise.all([
    supabase.from("member_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("invitation_status").select("*").order("created_at", { ascending: false }),
    supabase.from("guest_access").select("*").eq("status", "active").maybeSingle(),
    directorioDelClub(),
  ]);

  const sitio = urlDelSitio();
  type FilaIngreso = NonNullable<typeof invitaciones.data>[number];
  const comoIngreso = (i: FilaIngreso): Ingreso => ({
    id: i.id!,
    nombre: i.invitee_name ?? "Nuevo integrante",
    enlace: i.token ? `${sitio}/invitacion/${i.token}` : null,
    estado: ESTADO_INGRESO[i.effective_status ?? "unused"],
    detalle: detalleIngreso(i.effective_status, i.used_at, i.expires_at),
  });

  // Una solicitud aprobada enseña su ingreso dentro de la propia tarjeta.
  const porSolicitud = new Map<string, Ingreso>();
  const sueltos: Ingreso[] = [];
  for (const i of invitaciones.data ?? []) {
    if (i.request_id) porSolicitud.set(i.request_id, comoIngreso(i));
    else sueltos.push(comoIngreso(i));
  }

  return (
    <section className="page active" id="accesos" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      <header className="editorial-head proposal-head admin-editorial-head header-with-admin-art">
        <div className="editorial-head-copy">
          <div className="eyebrow">ADMINISTRACIÓN</div>
          <h1 className="page-title">Ingresos de integrantes</h1>
        </div>
        <div className="editorial-head-admin-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGENES.adminAccesos} alt="Accesos" />
        </div>
      </header>

      <div className="access-section-label">NUEVOS INTEGRANTES</div>

      <section className="content-card">
        <h2>Solicitudes de ingreso</h2>
        <p className="proposal-intro">
          Solicitudes enviadas por las integrantes. Revisa cada propuesta y registra tu decisión.
        </p>
        <div id="inviteRequestList">
          {solicitudes.data && solicitudes.data.length > 0 ? (
            solicitudes.data.map((s) => {
              const ingreso = porSolicitud.get(s.id);

              return (
                <article className="social-request" data-request-status={s.status} key={s.id}>
                  <strong>{s.invitee_name}</strong>
                  <span className="social-request-status">{ESTADO_SOLICITUD[s.status]}</span>
                  {s.note && <p>{s.note}</p>}
                  <small>
                    {nombreDe(directorio, s.proposed_by)} · {fechaHoraCorta(s.created_at)}
                  </small>

                  {/*
                   * Igual que el prototipo: una vez aprobada, la tarjeta deja de
                   * ofrecer decisiones y pasa a mostrar el ingreso que generó.
                   */}
                  <div className="club-actions" hidden={s.status === "approved"}>
                    {s.status !== "approved" && (
                      <FormularioAccion
                        accion={emitirInvitacion}
                        clase="club-button secondary"
                        etiquetaEnvio="Aprobar y crear ingreso"
                      >
                        <input type="hidden" name="solicitud" value={s.id} />
                        <input type="hidden" name="nombre" value={s.invitee_name} />
                      </FormularioAccion>
                    )}
                    {s.status !== "rejected" && (
                      <BotonAccion
                        accion={rechazarSolicitud}
                        campos={{ solicitud: s.id }}
                        clase="club-button secondary"
                        confirmacion="La propuesta se marca como rechazada. Quien la hizo no recibe aviso."
                      >
                        Rechazar
                      </BotonAccion>
                    )}
                    {s.status !== "pending" && (
                      <BotonAccion
                        accion={reabrirSolicitud}
                        campos={{ solicitud: s.id }}
                        clase="club-button secondary"
                      >
                        Volver a pendiente
                      </BotonAccion>
                    )}
                  </div>

                  {ingreso && (
                    <div className="entry-request-controls">
                      <ControlesDeIngreso ingreso={ingreso} />
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <p className="social-note">No hay solicitudes pendientes.</p>
          )}
        </div>
      </section>

      <FormularioAccion
        accion={emitirInvitacion}
        avisoAlPie
        etiquetaEnvio="＋ Crear ingreso"
        id="createInviteBtn"
      >
        <h2>Crear ingreso de nuevo integrante</h2>
        <p className="access-helper">
          Crea un enlace de un solo uso para una persona, sin una solicitud previa.
        </p>
        <input
          aria-label="Nombre del nuevo integrante"
          id="inviteName"
          maxLength={200}
          name="nombre"
          placeholder="Nombre y apellido"
          required
        />
      </FormularioAccion>

      <section className="content-card admin-generated-invites">
        <h2>Ingresos creados por administración</h2>
        <ActualizarIngresos />
        <div id="inviteList">
          {sueltos.length > 0 ? (
            sueltos.map((i) => <TarjetaIngreso key={i.id} ingreso={i} />)
          ) : (
            <p className="social-note">
              Aún no has creado ingresos directos. Los de solicitudes aprobadas aparecen junto a
              cada solicitud.
            </p>
          )}
        </div>
      </section>

      <div className="access-section-label access-section-label-guests">INVITADOS</div>

      <ClaveDeInvitadas
        clave={clave.data ? { id: clave.data.id, codigo: clave.data.code ?? "" } : null}
      />

      {clave.data && !clave.data.code && (
        <p className="club-muted">
          Esta clave se creó cuando todavía no se guardaba en claro, así que no se puede mostrar.
          Escribe uno en “Editar código” o genera otro con “Cambiar código”.
        </p>
      )}

      {clave.data && (
        <div className="guest-code-actions">
          <BotonAccion
            accion={revocarClaveDeInvitadas}
            campos={{ clave: clave.data.id }}
            tono="delicado"
            confirmacion="Quien tenga esa clave dejará de entrar en este momento."
          >
            Desactivar acceso para invitados
          </BotonAccion>
        </div>
      )}
    </section>
  );
}
