import Link from "next/link";
import { exigirAdministradora } from "@/lib/sesion";
import { renglonesDelHistorial } from "@/lib/exportar";
import {
  ESTADOS_EXPORTABLES,
  leerEstados,
  TITULOS,
  CLAVES,
  type EstadoExportable,
} from "@/lib/exportar-libro";
import { ESTADOS_SESION } from "@/lib/dominio";

export const metadata = { title: "Historial" };

/** Alterna un estado conservando los demás, para los chips de filtro. */
function rutaCon(estados: EstadoExportable[], estado: EstadoExportable) {
  const siguiente = estados.includes(estado)
    ? estados.filter((e) => e !== estado)
    : [...estados, estado];
  const orden = ESTADOS_EXPORTABLES.filter((e) => siguiente.includes(e));
  return `/admin/historial?estados=${(orden.length ? orden : ["past"]).join(",")}`;
}

export default async function Historial({
  searchParams,
}: {
  searchParams: Promise<{ estados?: string }>;
}) {
  await exigirAdministradora();
  const { estados: pedido } = await searchParams;
  const estados = leerEstados(pedido ?? null);
  const renglones = await renglonesDelHistorial(estados);

  return (
    <main className="px-5 pb-8">
      <Link
        href="/admin"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a administración
      </Link>

      <h1 className="editorial mt-5 text-[1.9rem] leading-tight">Historial</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
        Lo que ves aquí abajo es exactamente lo que se descarga. Las notas privadas no
        se exportan, y un dato que nunca se registró va en blanco.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {ESTADOS_EXPORTABLES.map((e) => {
          const activo = estados.includes(e);
          return (
            <Link
              key={e}
              href={rutaCon(estados, e)}
              aria-pressed={activo}
              className={`rounded-full border px-4 py-2 text-[14px] ${
                activo
                  ? "border-transparent text-white"
                  : "border-[var(--color-linea)] bg-[var(--color-blanco)]"
              }`}
              style={activo ? { background: ESTADOS_SESION[e].color } : undefined}
            >
              {ESTADOS_SESION[e].texto}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-[15px]">
        {renglones.length === 0
          ? "Ninguna discucharla con esos estados."
          : `${renglones.length} ${renglones.length === 1 ? "discucharla" : "discucharlas"}`}
      </p>

      {renglones.length > 0 && (
        <>
          <a
            href={`/admin/historial/descargar?estados=${estados.join(",")}`}
            className="mt-4 inline-block rounded-full px-6 py-3 text-[15px] font-medium text-white"
            style={{ background: "var(--color-tinta)" }}
          >
            Descargar Excel
          </a>

          {/* La tabla es ancha a propósito: se desplaza dentro de su caja para
              que la página nunca ruede en horizontal. */}
          <div className="mt-6 overflow-x-auto rounded-[var(--radius-suave)] border border-[var(--color-linea)]">
            <table className="w-max min-w-full border-collapse text-[13px]">
              <thead>
                <tr style={{ background: "var(--color-tinta)" }}>
                  {TITULOS.map((t) => (
                    <th
                      key={t}
                      scope="col"
                      className="px-3 py-2.5 text-left font-medium whitespace-nowrap text-white"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renglones.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--color-linea)]">
                    {CLAVES.map((clave) => (
                      <td
                        key={clave}
                        className="max-w-[22rem] truncate px-3 py-2.5 align-top"
                        title={String(r[clave] ?? "")}
                      >
                        {String(r[clave] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
