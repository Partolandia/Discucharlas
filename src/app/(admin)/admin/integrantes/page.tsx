import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirAdministradora, nombreCompleto } from "@/lib/sesion";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";
import { BotonAccion } from "@/components/admin/BotonAccion";
import {
  cambiarRol,
  cambiarEstadoCuenta,
  transferirPropiedad,
  eliminarIntegrante,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Integrantes" };

export default async function AdminIntegrantes() {
  const yo = await exigirAdministradora();
  const supabase = await crearClienteServidor();

  // Administración sí lee el perfil completo: necesita los datos de contacto
  // para operar el club.
  const [{ data: integrantes }, asistencias] = await Promise.all([
    supabase.from("profiles").select("*").order("first_name"),
    /*
     * Asistencia real a Discucharlas ya realizadas. No cuenta el RSVP a la
     * próxima ni las canceladas o en borrador: son cosas distintas.
     */
    supabase
      .from("session_attendance")
      .select("user_id, sessions!inner(status)")
      .eq("present", true)
      .eq("sessions.status", "past"),
  ]);

  const asistio = new Map<string, number>();
  for (const a of asistencias.data ?? []) {
    asistio.set(a.user_id, (asistio.get(a.user_id) ?? 0) + 1);
  }

  return (
    <section className="page active" id="miembros-admin" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      <header className="editorial-head club-head admin-editorial-head header-with-admin-art">
        <div className="editorial-head-copy">
          <div className="eyebrow">ADMINISTRACIÓN</div>
          <h1 className="page-title">Gestionar integrantes</h1>
        </div>
        <div className="editorial-head-admin-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGENES.adminIntegrantes} alt="Integrantes" />
        </div>
      </header>

      <p className="proposal-intro">
        Gestiona el estado y los permisos del Club. Puedes asignar o revocar el rol de
        administrador; el Club debe conservar siempre al menos un administrador activo.
      </p>

      <div id="memberAdminList">
        {(integrantes ?? []).map((p) => {
          const nombre = nombreCompleto(p);
          const suspendida = p.status === "suspended";
          const veces = asistio.get(p.id) ?? 0;

          return (
            <div key={p.id} className="member-admin-row" data-member-key={p.id}>
              <div>
                <b>{nombre}</b>
                <small
                  className="member-attendance-note"
                  title="Asistencia real registrada en Discucharlas realizadas."
                >
                  {veces
                    ? `Asistió a ${veces} ${veces === 1 ? "Discucharla" : "Discucharlas"}`
                    : "Sin asistencias registradas"}
                </small>
                {p.is_owner ? (
                  <span className="member-role-pill">PROPIETARIA</span>
                ) : (
                  p.role === "admin" && <span className="member-role-pill">ADMINISTRADOR</span>
                )}
                <small>
                  Estado:{" "}
                  <span className={`status-pill member-status ${suspendida ? "suspended" : "active"}`}>
                    {suspendida ? "Suspendido" : "Activo"}
                  </span>
                  {p.id === yo.id && " · Eres tú"}
                </small>
                <small>{p.email}</small>
              </div>

              <div className="member-admin-actions">
                {!suspendida && !p.is_owner && (
                  <BotonAccion
                    accion={cambiarRol}
                    campos={{ integrante: p.id, rol: p.role === "admin" ? "member" : "admin" }}
                    confirmacion={
                      p.role === "admin"
                        ? `${nombre} dejará de poder activar discucharlas, cerrar votaciones y gestionar accesos.`
                        : undefined
                    }
                    clase={
                      p.role === "admin"
                        ? "mini-btn role-action revoke"
                        : "mini-btn role-action"
                    }
                  >
                    {p.role === "admin" ? "Quitar rol admin" : "Hacer administrador"}
                  </BotonAccion>
                )}

                {!p.is_owner && (
                  <BotonAccion
                    accion={cambiarEstadoCuenta}
                    campos={{ integrante: p.id, estado: suspendida ? "active" : "suspended" }}
                    tono={suspendida ? "normal" : "delicado"}
                    confirmacion={
                      suspendida
                        ? undefined
                        : `${nombre} perderá el acceso al club hasta que la reactives.`
                    }
                  >
                    {suspendida ? "Reactivar" : "Suspender"}
                  </BotonAccion>
                )}

                {yo.is_owner && !p.is_owner && !suspendida && (
                  <BotonAccion
                    accion={transferirPropiedad}
                    campos={{ integrante: p.id }}
                    tono="delicado"
                    confirmacion={`${nombre} pasará a ser la propietaria del club. Tú sigues siendo administradora, pero ya no podrás transferir la propiedad.`}
                  >
                    Transferir propiedad
                  </BotonAccion>
                )}

                {suspendida && !p.is_owner && p.id !== yo.id && (
                  <BotonAccion
                    accion={eliminarIntegrante}
                    campos={{ integrante: p.id }}
                    tono="delicado"
                    confirmacion={`Se borra la cuenta de ${nombre} y todo lo que depende de ella: votos, confirmaciones, notas privadas y reacciones. Sus propuestas y comentarios se quedan, pero sin autora. No hay vuelta atrás.`}
                  >
                    Eliminar
                  </BotonAccion>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
