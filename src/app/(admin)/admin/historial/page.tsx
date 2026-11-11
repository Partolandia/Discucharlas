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
import { Backline } from "@/components/prototipo/Backline";

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
    <section className="page admin-history-page active" id="exportar-historial" data-admin-page="true">
      <Backline a="/admin" texto="Volver a Administración" />

      <header className="editorial-head admin-history-head">
        <div className="eyebrow">ADMINISTRACIÓN</div>
        <h1 className="page-title">Historial de Discucharlas</h1>
        <p>
          Filtra por estatus, revisa la vista previa compacta y descarga exactamente ese registro en
          Excel.
        </p>
      </header>

      <section className="content-card admin-history-summary">
        <div>
          <span className="mini-kicker">REGISTRO DEL CLUB</span>
          <h2>
            {renglones.length}{" "}
            {renglones.length === 1 ? "Discucharla seleccionada" : "Discucharlas seleccionadas"}
          </h2>
          <p>
            Lo que ves aquí abajo es exactamente lo que se descarga. Un dato que nunca se registró
            va en blanco.
          </p>
        </div>

        <div className="admin-history-filter-group">
          <span className="admin-history-filter-label">Incluir en el Excel</span>
          <div className="admin-history-filter-chips">
            {ESTADOS_EXPORTABLES.map((e) => {
              const activo = estados.includes(e);
              return (
                <Link
                  key={e}
                  className="admin-history-chip"
                  href={rutaCon(estados, e)}
                  // Cada chip apunta a esta misma pantalla con otro filtro, y
                  // armar la vista previa cuesta varias consultas. Precargar
                  // las cuatro combinaciones que nadie va a tocar deja peticiones
                  // colgando que estorban a la navegación de verdad.
                  prefetch={false}
                  aria-pressed={activo}
                  data-activo={activo ? "si" : undefined}
                >
                  <input type="checkbox" checked={activo} readOnly tabIndex={-1} />
                  <span>{ESTADOS_SESION[e].texto}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {renglones.length > 0 && (
          <a
            className="new admin-history-download"
            href={`/admin/historial/descargar?estados=${estados.join(",")}`}
          >
            ↓ Descargar Excel
          </a>
        )}

        <small className="admin-history-privacy">
          Las notas privadas de integrantes no forman parte de esta exportación.
        </small>
      </section>

      <div className="admin-history-list">
        {renglones.length === 0 ? (
          <div className="admin-history-empty">Ninguna discucharla con esos estados.</div>
        ) : (
          renglones.map((r) => (
            <article key={r.id} className="admin-history-card admin-history-compact-card">
              <div className="admin-history-card-head admin-history-compact-head">
                <h3>{r.episodio || "Sin título"}</h3>
                <span className="admin-history-status">{r.estado}</span>
              </div>
              <p className="admin-history-podcast">{r.podcast}</p>
              <div className="admin-history-compact-meta">
                {CLAVES.map((clave, i) =>
                  clave === "episodio" || clave === "estado" || clave === "podcast" ? null : (
                    <div key={clave} className="admin-history-meta-item">
                      <b>{TITULOS[i]}</b>
                      <span>{String(r[clave] ?? "") || "—"}</span>
                    </div>
                  )
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
