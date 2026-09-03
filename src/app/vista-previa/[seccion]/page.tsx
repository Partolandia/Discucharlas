import { notFound } from "next/navigation";
import { NavegacionInferior } from "@/components/NavegacionInferior";
import { CabeceraApp } from "@/components/CabeceraApp";
import { EncabezadoSeccion } from "@/components/EncabezadoSeccion";
import { RejillaMes } from "@/components/calendario/RejillaMes";
import { SECCIONES, ORDEN_NAV, type ClaveSeccion } from "@/lib/secciones";

/**
 * Vista previa del sistema visual con datos inventados.
 *
 * Existe para revisar el cascarón sin levantar Supabase ni tener cuenta. No se
 * publica: en producción responde 404.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return ORDEN_NAV.map((seccion) => ({ seccion }));
}

const SESIONES = [
  { id: "a", date: "2026-08-07", status: "past", episode_title: "Gestación subrogada" },
  { id: "b", date: "2026-08-21", status: "upcoming", episode_title: "Democratizar el privilegio intelectual" },
  { id: "c", date: "2026-08-28", status: "cancelled", episode_title: "Sesión que no pudo ser" },
];

export default async function VistaPrevia({
  params,
}: {
  params: Promise<{ seccion: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { seccion } = await params;
  if (!(seccion in SECCIONES)) notFound();
  const clave = seccion as ClaveSeccion;

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-28">
      <CabeceraApp nombre="Isa" inicial="I" sinLeer={2} esAdmin seccionForzada={clave} />

      <main className="px-5 pb-8">
        {clave === "inicio" ? (
          <p className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-5 py-6 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
            Inicio no lleva encabezado cromático: su hero ya tiene suficiente fuerza.
            Entra con una cuenta para verlo con datos reales.
          </p>
        ) : (
          <EncabezadoSeccion
            clave={clave}
            dato={clave === "club" ? "4 integrantes · 2 discucharlas realizadas" : undefined}
          />
        )}

        {clave === "calendario" && (
          <RejillaMes mes="2026-08" sesiones={SESIONES} hrefMes={() => "/vista-previa/calendario"} />
        )}

        <nav aria-label="Otras secciones" className="mt-8">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--color-tinta-suave)] uppercase">
            Vista previa
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ORDEN_NAV.map((s) => (
              <li key={s}>
                <a
                  href={`/vista-previa/${s}`}
                  className="inline-block rounded-full border border-[var(--color-linea)] px-4 py-2 text-[14px]"
                  style={s === clave ? { background: SECCIONES[s].color, color: "#fff" } : undefined}
                >
                  {SECCIONES[s].nav}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <NavegacionInferior seccionForzada={clave} />
    </div>
  );
}
