import { Backline } from "@/components/prototipo/Backline";

/**
 * Guía del club, con el texto y la estructura del prototipo v2.
 *
 * El contenido va aquí y no en `guide_sections` a propósito: la tabla guarda
 * título y cuerpo planos, y estas tarjetas tienen agenda por horas, pasos
 * numerados y principios. Si se quiere que administración los edite, hay que
 * decidir antes cómo se modela; queda señalado.
 */
export function PantallaGuia({
  volverA = "/inicio",
  volverTexto = "Volver a Inicio",
}: {
  volverA?: string;
  volverTexto?: string;
} = {}) {
  return (
    <section className="page active" id="guia">
      <Backline a={volverA} texto={volverTexto} etiqueta="Volver" clase="backline-home" />

      <header className="guide-page-head">
        <div className="eyebrow">GUÍA DEL CLUB</div>
        <h1>Cómo funciona nuestro círculo</h1>
        <p>Lo esencial para vivir una Discucharla.</p>
      </header>

      <article
        className="guide-card guide-card-intro"
        data-guide-card="intro"
        style={{ ["--guide-accent" as string]: "#513451" }}
      >
        <div className="guide-card-head">
          <div>
            <span className="guide-kicker">01</span>
            <h2>Qué es Discucharlas</h2>
          </div>
        </div>
        <div className="guide-editable">
          <p className="guide-manifesto">
            <strong>Ideas que inspiran conversaciones.</strong>
          </p>
          <p>
            Discucharlas nació de algo muy sencillo: escuchar un buen podcast y querer seguir
            hablando de él.
          </p>
          <p>
            Discucharlas es un grupo que se reúne{" "}
            <strong>cada quince días, generalmente en viernes</strong>, para comentar a partir de un
            podcast inspirador nuestras historias, puntos de vista, ideas y preguntas que despiertan
            curiosidad.
          </p>
          <p>Aquí no hay opiniones correctas o incorrectas. Nos encanta escuchar todas las opiniones.</p>
        </div>
      </article>

      <article
        className="guide-card guide-card-agenda"
        data-guide-card="agenda"
        style={{ ["--guide-accent" as string]: "#C77B83" }}
      >
        <div className="guide-card-head">
          <div>
            <span className="guide-kicker">02</span>
            <h2>Agenda de una Discucharla</h2>
          </div>
        </div>
        <div className="guide-editable guide-timeline">
          <div className="guide-time-row">
            <time>6:00–7:30</time>
            <div>
              <strong>Llegada y convivencia</strong>
            </div>
          </div>
          <div className="guide-time-row">
            <time>7:30–8:00</time>
            <div>
              <strong>Bienvenida</strong>
              <span>
                Presentación de integrantes cuando hay alguien nuevo y breve resumen del podcast.
              </span>
            </div>
          </div>
          <div className="guide-time-row">
            <time>8:00–9:30</time>
            <div>
              <strong>Opinión y discusión</strong>
              <span>
                <b>Ronda 1:</b> cada integrante comparte su opinión sin interrupciones, empezando por
                quienes escucharon el podcast. <b>Ronda 2:</b> conversación abierta, discusión y
                debate.
              </span>
            </div>
          </div>
          <div className="guide-time-row">
            <time>9:30–10:00</time>
            <div>
              <strong>Calificación y convivencia libre</strong>
            </div>
          </div>
        </div>
      </article>

      <article
        className="guide-card guide-card-flow"
        data-guide-card="flow"
        style={{ ["--guide-accent" as string]: "#535E39" }}
      >
        <div className="guide-card-head">
          <div>
            <span className="guide-kicker">03</span>
            <h2>Cómo funciona</h2>
          </div>
        </div>
        <div className="guide-editable guide-steps">
          <Paso n="1" titulo="Proponemos">
            Cualquier integrante puede proponer un podcast en la sección <b>Propuestas</b> de esta
            APP.
          </Paso>
          <Paso n="2" titulo="Votamos">
            Suele elegirse por mayoría de votos. Consulta la votación activa en la sección{" "}
            <b>Propuestas/Votación Activa</b>.
          </Paso>
          <Paso n="3" titulo="Escuchamos">
            Puedes guardar tus ideas en la app. En{" "}
            <b>Inicio / Ver detalle de la Próxima Discucharla</b> encontrarás un espacio de notas
            personales.
          </Paso>
          <Paso n="4" titulo="Confirmamos">
            Confirma tu asistencia en la ficha de <b>Próxima Discucharla</b> encontrada en la Sección
            de <b>Inicio</b>.
          </Paso>
          <Paso n="5" titulo="Nos encontramos">
            Normalmente los viernes, de <b>6:00 a 10:00 PM</b>.
          </Paso>
          <Paso n="6" titulo="Lo guardamos">
            Podemos registrar notas, comentarios, links, imágenes y documentos, además de calificar
            el podcast por su contenido.
          </Paso>
        </div>
      </article>

      <article
        className="guide-card guide-card-values"
        data-guide-card="values"
        style={{ ["--guide-accent" as string]: "#D49A3A" }}
      >
        <div className="guide-card-head">
          <div>
            <span className="guide-kicker">04</span>
            <h2>Algunas cosas importantes</h2>
          </div>
        </div>
        <div className="guide-editable guide-values">
          <div className="guide-value">
            <strong>Respeto, confianza y apertura</strong>
            <p>
              <b>Escuchamos todas las opiniones con respeto</b>, cuidamos lo que se comparte en
              confianza y <b>mantenemos apertura a ideas distintas a las nuestras</b>.
            </p>
          </div>
          <div className="guide-value">
            <strong>Sin compromiso de asistencia</strong>
            <p>
              Es un espacio libre y de confianza. <b>No hay compromiso ni competencia de asistencia</b>
              , y <b>puedes venir aunque no hayas escuchado el podcast</b>.
            </p>
          </div>
          <div className="guide-value">
            <strong>Elegimos para conversar</strong>
            <p>
              <b>Todos pueden proponer episodios.</b> Buscamos especialmente aquellos que{" "}
              <b>despierten distintas opiniones y generen conversación</b>, más que contenidos solo
              informativos.
            </p>
          </div>
          <div className="guide-value">
            <strong>Nuestro círculo puede crecer</strong>
            <p>
              <b>Invitados y nuevas integrantes son bienvenidos.</b> Queremos crecer sin dejar de
              sentirnos como un círculo cercano, por eso agradecemos que{" "}
              <b>las personas que invites a sumarse sean de tu entera confianza</b>.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

function Paso({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="guide-step">
      <span>{n}</span>
      <div>
        <strong>{titulo}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
