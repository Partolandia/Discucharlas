import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub } from "@/lib/club";
import { EncabezadoSeccion } from "@/components/EncabezadoSeccion";
import { ProponerIntegrante } from "@/components/club/ProponerIntegrante";
import { Avatar } from "@/components/club/Avatar";

export const metadata = { title: "Club" };

export default async function Club() {
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const [directorio, realizadas, asistencias] = await Promise.all([
    directorioDelClub(),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "past"),
    supabase.from("session_attendance").select("user_id").eq("present", true),
  ]);

  const porIntegrante = new Map<string, number>();
  for (const a of asistencias.data ?? []) {
    porIntegrante.set(a.user_id, (porIntegrante.get(a.user_id) ?? 0) + 1);
  }

  // La propia primero; el resto por nombre.
  const integrantes = [...directorio.values()].sort((a, b) => {
    if (a.id === perfil.id) return -1;
    if (b.id === perfil.id) return 1;
    return (a.first_name ?? "").localeCompare(b.first_name ?? "", "es");
  });

  const conteo = [
    `${integrantes.length} ${integrantes.length === 1 ? "integrante" : "integrantes"}`,
    `${realizadas.count ?? 0} ${realizadas.count === 1 ? "discucharla realizada" : "discucharlas realizadas"}`,
  ].join(" · ");

  return (
    <main className="px-5 pb-8">
      <EncabezadoSeccion clave="club" dato={conteo} />

      <div className="mt-7 flex items-baseline justify-between gap-3">
        <h2
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: "var(--color-club-fuerte)" }}
        >
          Quiénes somos
        </h2>
        <p className="shrink-0 text-[13px] text-[var(--color-tinta-suave)]">
          Toca un perfil para conocerla
        </p>
      </div>

      <div className="mt-4">
        <ProponerIntegrante />
      </div>

      <ul className="mt-3 space-y-3">
        {integrantes.map((i) => {
          const nombre = [i.first_name, i.last_name].filter(Boolean).join(" ").trim();
          const propia = i.id === perfil.id;
          const sesiones = porIntegrante.get(i.id) ?? 0;

          return (
            <li key={i.id}>
              <Link
                href={propia ? "/perfil" : `/club/${i.id}`}
                className="flex items-center gap-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] px-4 py-4"
              >
                <Avatar id={i.id} nombre={nombre} />

                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold tracking-wide text-[var(--color-tinta-suave)] uppercase">
                    {propia ? "Tu perfil" : "Integrante"}
                    {i.role === "admin" && " · Administradora"}
                  </span>
                  <span className="editorial mt-0.5 block text-[1.3rem] leading-tight">
                    {nombre}
                  </span>
                  <span
                    className="mt-0.5 block text-[13px]"
                    style={{ color: "var(--color-comunidad-fuerte)" }}
                  >
                    {propia
                      ? "Ver y editar perfil"
                      : `${sesiones} ${sesiones === 1 ? "discucharla" : "discucharlas"} · Ver perfil`}
                  </span>
                </span>

                <span aria-hidden className="shrink-0 text-[var(--color-tinta-suave)]">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
