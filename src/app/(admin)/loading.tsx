/** Lo mismo que en la zona de integrantes: el cascarón se queda, el contenido no. */
export default function Cargando() {
  return (
    <section className="page active" aria-busy="true">
      <div className="prototype-empty-state" style={{ display: "block" }}>
        <span className="empty-mark">◦</span>
        <b>Cargando…</b>
      </div>
    </section>
  );
}
