import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { directorioDelClub, nombreDe } from "@/lib/club";
import { fechaLarga } from "@/lib/fechas";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { Campo } from "@/components/ui/Campo";
import {
  emitirInvitacion,
  revocarInvitacion,
  generarClaveDeInvitadas,
  revocarClaveDeInvitadas,
  rechazarSolicitud,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Accesos" };

const ESTADO_INVITACION: Record<string, { texto: string; color: string }> = {
  unused: { texto: "Vigente", color: "var(--color-propuestas-fuerte)" },
  used: { texto: "Usada", color: "var(--color-tinta-suave)" },
  revoked: { texto: "Revocada", color: "var(--color-error)" },
  expired: { texto: "Caducada", color: "var(--color-aviso)" },
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
    <main className="px-5 pb-8">
      <Link
        href="/admin"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a administración
      </Link>

      <h1 className="editorial mt-5 text-[1.9rem] leading-tight">Accesos</h1>

      {/* ------------------------------------------------------------------ */}
      {/* Propuestas del club                                                 */}
      {/* ------------------------------------------------------------------ */}
      {solicitudes.data && solicitudes.data.length > 0 && (
        <section className="mt-7">
          <h2 className="editorial text-[1.4rem]">Propuestas del club</h2>
          <ul className="mt-4 space-y-3">
            {solicitudes.data.map((s) => (
              <li
                key={s.id}
                className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
              >
                <h3 className="text-[16px] font-medium">{s.invitee_name}</h3>
                <p className="mt-0.5 text-[14px] text-[var(--color-tinta-suave)]">
                  Propuesta por {nombreDe(directorio, s.proposed_by)}
                  {s.invitee_email && ` · ${s.invitee_email}`}
                </p>
                {s.note && (
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
                    {s.note}
                  </p>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-[15px] font-medium underline underline-offset-4">
                    Invitarla
                  </summary>
                  <div className="mt-4">
                    <FormularioAccion accion={emitirInvitacion} etiquetaEnvio="Crear invitación">
                      <input type="hidden" name="solicitud" value={s.id} />
                      <Campo etiqueta="Nombre" name="nombre" defaultValue={s.invitee_name} required />
                      <Campo
                        etiqueta="Correo"
                        name="email"
                        type="email"
                        defaultValue={s.invitee_email ?? ""}
                        required
                      />
                    </FormularioAccion>
                  </div>
                </details>

                <div className="mt-3">
                  <BotonAccion
                    accion={rechazarSolicitud}
                    campos={{ solicitud: s.id }}
                    tono="delicado"
                    confirmacion="La propuesta se marca como rechazada. Quien la hizo no recibe aviso."
                  >
                    Rechazar
                  </BotonAccion>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Invitaciones                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-8 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5">
        <h2 className="editorial text-[1.3rem]">Invitar a una integrante</h2>
        <p className="mt-1 mb-4 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
          El enlace se muestra una sola vez. Caduca el día antes de la próxima discucharla.
        </p>
        <FormularioAccion accion={emitirInvitacion} etiquetaEnvio="Crear invitación">
          <Campo etiqueta="Nombre" name="nombre" required maxLength={120} />
          <Campo etiqueta="Correo" name="email" type="email" required />
        </FormularioAccion>
      </section>

      {invitaciones.data && invitaciones.data.length > 0 && (
        <section className="mt-7">
          <h2 className="editorial text-[1.4rem]">Invitaciones emitidas</h2>
          <ul className="mt-4 space-y-3">
            {invitaciones.data.map((i) => {
              const estado = ESTADO_INVITACION[i.effective_status ?? "unused"];
              return (
                <li
                  key={i.id}
                  className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">{i.invitee_name}</span>
                      <span className="text-[14px] text-[var(--color-tinta-suave)]">
                        {i.invitee_email}
                      </span>
                    </span>
                    <span
                      className="shrink-0 text-[11px] font-semibold tracking-wide uppercase"
                      style={{ color: estado.color }}
                    >
                      {estado.texto}
                    </span>
                  </div>

                  {i.expires_at && i.effective_status === "unused" && (
                    <p className="mt-1.5 text-[13px] text-[var(--color-tinta-suave)]">
                      Caduca el {fechaLarga(i.expires_at)}
                    </p>
                  )}

                  {i.effective_status === "unused" && i.id && (
                    <div className="mt-3">
                      <BotonAccion
                        accion={revocarInvitacion}
                        campos={{ invitacion: i.id }}
                        tono="delicado"
                        confirmacion="El enlace deja de servir en este momento."
                      >
                        Revocar
                      </BotonAccion>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Clave de invitadas                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-8 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5">
        <h2 className="editorial text-[1.3rem]">Clave de invitadas</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
          Con ella, alguien de fuera ve la próxima discucharla y la guía del club. Nada más:
          ni comunidad, ni perfiles, ni historial.
        </p>

        {clave.data ? (
          <div className="mt-4">
            <p className="text-[15px]">
              Hay una clave activa
              {clave.data.label && ` (${clave.data.label})`}, creada el{" "}
              {fechaLarga(clave.data.created_at)}.
            </p>
            <p className="mt-1 text-[14px] text-[var(--color-tinta-suave)]">
              No se puede volver a mostrar. Si se perdió, genera una nueva.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <BotonAccion
                accion={revocarClaveDeInvitadas}
                campos={{ clave: clave.data.id }}
                tono="delicado"
                confirmacion="Quien tenga esa clave dejará de entrar en este momento."
              >
                Revocar
              </BotonAccion>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[15px] text-[var(--color-tinta-suave)]">
            No hay ninguna clave activa.
          </p>
        )}

        <details className="mt-5">
          <summary className="cursor-pointer text-[15px] font-medium underline underline-offset-4">
            Generar una clave nueva
          </summary>
          <div className="mt-4">
            <p className="mb-3 text-[14px] leading-relaxed" style={{ color: "var(--color-aviso)" }}>
              Al generar una nueva, la anterior deja de servir de inmediato.
            </p>
            <FormularioAccion accion={generarClaveDeInvitadas} etiquetaEnvio="Generar clave">
              <Campo
                etiqueta="Para qué es (opcional)"
                name="etiqueta"
                maxLength={120}
                placeholder="Sesión de octubre"
              />
            </FormularioAccion>
          </div>
        </details>
      </section>
    </main>
  );
}
