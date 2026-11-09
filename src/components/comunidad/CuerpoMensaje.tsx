/**
 * Cuerpo de un mensaje de Comunidad.
 *
 * El prototipo v2 convierte en enlace pulsable lo que se escribe como
 * dirección web. Se hace aquí, al pintar, y no al guardar: el texto en la base
 * sigue siendo el que escribió la persona.
 */
const ENLACE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]}"'])/g;

export function CuerpoMensaje({ texto }: { texto: string }) {
  return (
    <p className="social-message-body">
      {/* split con grupo de captura deja los enlaces en los índices impares */}
      {texto.split(ENLACE).map((trozo, i) =>
        i % 2 === 1 ? (
          <a key={i} href={trozo} target="_blank" rel="noopener noreferrer">
            {trozo}
          </a>
        ) : (
          trozo
        )
      )}
    </p>
  );
}
