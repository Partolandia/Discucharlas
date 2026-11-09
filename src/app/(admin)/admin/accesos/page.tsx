import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { fechaLarga } from "@/lib/fechas";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { TarjetaIngreso, type Ingreso } from "@/components/admin/TarjetaIngreso";
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

/** Los estados que el prototipo v2 pinta en `.entry-state`. */
const ESTADO_INGRESO: Record<string, Ingreso["estado"]> = {
  unused: "active",
  used: "used",
  revoked: "revoked",
  expired: "expired",
};

function detalleIngreso(
  estado: string | null,
  usado: string | null,
  caduca: string | null
): string {
  if (estado === "used") return usado ? `Cuenta creada el ${fechaLarga(usado)}` : "Cuenta creada";
  if (estado === "unused" && caduca) return `Vence el ${fechaLarga(caduca)}`;
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
          Al aprobarla se genera un enlace único de un solo uso para que esa persona cree su
          cuenta.
        </p>
        <div id="inviteRequestList">
          {solicitudes.data && solicitudes.data.length > 0 ? (
            solicitudes.data.map((s) => (
              <article className="social-request" data-request-status={s.status} key={s.id}>
                <strong>{s.invitee_name}</strong>
                <span className="social-request-status">{ESTADO_SOLICITUD[s.status]}</span>
                {s.note && <p>{s.note}</p>}
                <small>
                  {nombreDe(directorio, s.proposed_by)} · {fechaLarga(s.created_at)}
                  {s.invitee_email && ` · ${s.invitee_email}`}
                </small>

                {s.status === "pending" && (
                  <FormularioAccion
                    accion={emitirInvitacion}
                    etiquetaEnvio="Aprobar y crear ingreso"
                  >
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
                )}

                <div className="club-actions">
                  {s.status !== "rejected" && (
                    <BotonAccion
                      accion={rechazarSolicitud}
                      campos={{ solicitud: s.id }}
                      tono="delicado"
                      confirmacion="La propuesta se marca como rechazada. Quien la hizo no recibe aviso."
                    >
                      Rechazar
                    </BotonAccion>
                  )}
                  {s.status !== "pending" && (
                    <BotonAccion accion={reabrirSolicitud} campos={{ solicitud: s.id }}>
                      Volver a pendiente
                    </BotonAccion>
                  )}
                </div>

                {s.status === "approved" && (
                  <p className="social-note">
                    La propuesta está aprobada. El alta de la cuenta y su acceso se realizan desde
                    la administración habitual; no se conceden automáticamente.
                  </p>
                )}
              </article>
            ))
          ) : (
            <p className="social-note">No hay solicitudes pendientes.</p>
          )}
        </div>
      </section>

      <FormularioAccion
        accion={emitirInvitacion}
        etiquetaEnvio="＋ Crear ingreso"
        id="createInviteBtn"
      >
        <h2>Crear ingreso de nuevo integrante</h2>
        <p className="access-helper">
          Crea un enlace de un solo uso para una persona, sin una solicitud previa. El enlace se
          muestra una sola vez.
        </p>
        <label htmlFor="inviteName">NOMBRE</label>
        <input
          id="inviteName"
          name="nombre"
          required
          maxLength={120}
          placeholder="Nombre de la persona"
        />
        <input name="email" type="email" required placeholder="Correo de la persona" />
      </FormularioAccion>

      <section className="content-card admin-generated-invites">
        <h2>Ingresos creados por administración</h2>
        <div id="inviteList">
          {invitaciones.data && invitaciones.data.length > 0 ? (
            invitaciones.data.map((i) => (
              <TarjetaIngreso
                key={i.id}
                ingreso={{
                  id: i.id!,
                  nombre: i.invitee_name ?? "Nuevo integrante",
                  enlace: null,
                  estado: ESTADO_INGRESO[i.effective_status ?? "unused"],
                  detalle: detalleIngreso(i.effective_status, i.used_at, i.expires_at),
                }}
              />
            ))
          ) : (
            <p className="social-note">
              Aún no has creado ingresos directos. Los ingresos de solicitudes aprobadas aparecen
              junto a cada solicitud.
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
