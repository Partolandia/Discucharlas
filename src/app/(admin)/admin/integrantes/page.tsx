import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirAdministradora, nombreCompleto } from "@/lib/sesion";
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
  const { data: integrantes } = await supabase
    .from("profiles")
    .select("*")
    .order("first_name");

  const admins = (integrantes ?? []).filter((p) => p.role === "admin" && p.status === "active");

  return (
    <main className="px-5 pb-8">
      <Link
        href="/admin"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a administración
      </Link>

      <h1 className="editorial mt-5 text-[1.9rem] leading-tight">Integrantes</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
        El club conserva siempre al menos una administradora activa. Para suspender una
        cuenta hay que quitarle antes ese rol.
      </p>

      <ul className="mt-6 space-y-3">
        {(integrantes ?? []).map((p) => {
          const nombre = nombreCompleto(p);
          const suspendida = p.status === "suspended";
          const soyYo = p.id === yo.id;

          return (
            <li
              key={p.id}
              className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
              style={suspendida ? { opacity: 0.72 } : undefined}
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 className="editorial text-[1.25rem] leading-tight">{nombre}</h2>
                {p.is_owner && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                    style={{ background: "var(--color-admin-oro)", color: "var(--color-tinta)" }}
                  >
                    Propietaria
                  </span>
                )}
                {p.role === "admin" && !p.is_owner && (
                  <span className="text-[12px] font-semibold tracking-wide text-[var(--color-tinta-suave)] uppercase">
                    Admin
                  </span>
                )}
                {suspendida && (
                  <span
                    className="text-[12px] font-semibold tracking-wide uppercase"
                    style={{ color: "var(--color-error)" }}
                  >
                    Suspendida
                  </span>
                )}
              </div>

              <p className="mt-1 text-[14px] text-[var(--color-tinta-suave)]">{p.email}</p>
              {p.phone && (
                <p className="text-[14px] text-[var(--color-tinta-suave)]">{p.phone}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
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
                    {p.role === "admin" ? "Quitar admin" : "Hacer admin"}
                  </BotonAccion>
                )}

                {!p.is_owner && (
                  <BotonAccion
                    accion={cambiarEstadoCuenta}
                    campos={{
                      integrante: p.id,
                      estado: suspendida ? "active" : "suspended",
                    }}
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

                {soyYo && (
                  <span className="self-center text-[13px] text-[var(--color-tinta-suave)]">
                    Eres tú
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-[14px] text-[var(--color-tinta-suave)]">
        {admins.length === 1
          ? "Ahora mismo hay una sola administradora activa, así que no se le puede quitar el rol."
          : `Hay ${admins.length} administradoras activas.`}
      </p>
    </main>
  );
}
