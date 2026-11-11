/**
 * Lo que se ve mientras la siguiente sección llega del servidor.
 *
 * Sin esto, el router espera a tener la pantalla entera antes de cambiar nada y
 * cada toque parecía que no había hecho efecto. Con una frontera de carga el
 * cascarón —barra, ceja y pestañas— se queda fijo y solo parpadea el contenido,
 * que además el router puede precargar.
 */
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
