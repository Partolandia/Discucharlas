import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaCorta, hora } from "@/lib/fechas";
import { ESTADOS_SESION, type EstadoSesion } from "@/lib/dominio";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { Campo } from "@/components/ui/Campo";
import {
  crearDiscucharla,
  activarDiscucharla,
  cambiarEstadoDiscucharla,
} from "@/app/(admin)/admin/acciones";

export const metadata = { title: "Discucharlas" };

export default async function AdminDiscucharlas() {
  const supabase = await crearClienteServidor();
  const { data: sesiones } = await supabase
    .from("sessions")
    .select("*")
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <main className="px-5 pb-8">
      <Link
        href="/admin"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a administración
      </Link>

      <h1 className="editorial mt-5 text-[1.9rem] leading-tight">Discucharlas</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
        Solo puede haber una próxima a la vez. Para activar otra, marca la actual como
        realizada o cancélala.
      </p>

      <section className="mt-7 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5">
        <h2 className="editorial text-[1.3rem]">Nueva discucharla</h2>
        <p className="mt-1 mb-4 text-[14px] text-[var(--color-tinta-suave)]">
          Se crea como borrador; el club no la ve hasta que la actives.
        </p>

        <FormularioAccion accion={crearDiscucharla} etiquetaEnvio="Crear borrador">
          <Campo etiqueta="Episodio" name="episodio" required maxLength={200} />
          <Campo etiqueta="Podcast" name="podcast" required maxLength={160} />
          <Campo etiqueta="Enlace para escucharlo" name="url" type="url" />
          <Campo etiqueta="Fecha" name="fecha" type="date" />
          <div className="flex gap-3">
            <div className="flex-1">
              <Campo etiqueta="Empieza" name="inicio" type="time" />
            </div>
            <div className="flex-1">
              <Campo etiqueta="Termina" name="fin" type="time" />
            </div>
          </div>
          <Campo etiqueta="Lugar" name="lugar" maxLength={200} placeholder="Casa de Ana" />
          <div className="space-y-1.5">
            <label htmlFor="resumen" className="block text-[15px] font-medium">
              Resumen
            </label>
            <textarea
              id="resumen"
              name="resumen"
              rows={3}
              maxLength={4000}
              className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
            />
          </div>
        </FormularioAccion>
      </section>

      <h2 className="editorial mt-9 text-[1.4rem]">Todas</h2>

      {sesiones && sesiones.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {sesiones.map((s) => {
            const identidad = ESTADOS_SESION[s.status as EstadoSesion];
            return (
              <li
                key={s.id}
                className="rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="text-[11px] font-semibold tracking-wide uppercase"
                      style={{ color: identidad.color }}
                    >
                      {identidad.texto} · {s.human_id}
                    </span>
                    <h3 className="editorial mt-1 text-[1.2rem] leading-snug">
                      {s.episode_title}
                    </h3>
                    <p className="mt-0.5 text-[14px] text-[var(--color-tinta-suave)]">
                      {[
                        s.podcast_name,
                        s.date && fechaCorta(s.date),
                        hora(s.start_time),
                        s.place,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
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
                    <Link
                      href={`/admin/discucharlas/${s.id}`}
                      className="rounded-full border border-[var(--color-linea)] bg-[var(--color-blanco)] px-4 py-1.5 text-[13px] font-medium"
                    >
                      Asistencia y aportes
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-[15px] text-[var(--color-tinta-suave)]">
          Todavía no hay ninguna. Crea la primera arriba.
        </p>
      )}
    </main>
  );
}
