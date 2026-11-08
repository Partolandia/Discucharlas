import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirAdministradora, nombreCompleto } from "@/lib/sesion";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";
import { BotonAccion } from "@/components/admin/BotonAccion";
import {
  cambiarRol,
  cambiarEstadoCuenta,
  transferirPropiedad,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Integrantes" };

export default async function AdminIntegrantes() {
  const yo = await exigirAdministradora();
  const supabase = await crearClienteServidor();

  // Administración sí lee el perfil completo: necesita los datos de contacto
  // para operar el club.
  const { data: integrantes } = await supabase.from("profiles").select("*").order("first_name");

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

      <div>
        {(integrantes ?? []).map((p) => {
          const nombre = nombreCompleto(p);
          const suspendida = p.status === "suspended";

          return (
            <div key={p.id} className="member-admin-row">
              <div>
                <b>{nombre}</b>
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
                    tono={p.role === "admin" ? "normal" : "principal"}
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
