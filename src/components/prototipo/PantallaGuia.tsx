import { Backline } from "@/components/prototipo/Backline";
import { TarjetaGuia } from "@/components/prototipo/TarjetaGuia";
import type { SeccionGuia } from "@/lib/guia";

/**
 * Guía del club, con el texto y la estructura del prototipo v2.
 *
 * El texto original vive aquí porque las tarjetas tienen forma propia (agenda
 * por horas, pasos numerados, principios) y no cabe en el `title`/`body` de
 * `guide_sections`. Cuando administración edita una tarjeta, su HTML sí se
 * guarda en esa tabla y sustituye al original.
 */
export function PantallaGuia({
  volverA = "/inicio",
  volverTexto = "Volver a Inicio",
  esAdmin = false,
  guardadas = {},
}: {
  volverA?: string;
  volverTexto?: string;
  esAdmin?: boolean;
  guardadas?: Partial<Record<SeccionGuia, string>>;
} = {}) {
  const comun = { esAdmin };

  return (
    <section className="page active" id="guia">
      <Backline
        a={volverA}
        texto={volverTexto}
        etiqueta="Volver"
        clase="backline-home"
        idTexto="guideBackLabel"
      />

      <header className="guide-page-head">
        <div className="eyebrow">GUÍA DEL CLUB</div>
        <h1>Cómo funciona nuestro círculo</h1>
        <p>Lo esencial para vivir una Discucharla.</p>
      </header>

      <TarjetaGuia
        {...comun}
        acento="#513451"
        clase="guide-card-intro"
        guardado={guardadas.intro ?? null}
        numero="01"
        seccion="intro"
        titulo="Qué es Discucharlas"
      >
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
      </TarjetaGuia>

      <TarjetaGuia
        {...comun}
        acento="#C77B83"
        clase="guide-card-agenda"
        claseCuerpo="guide-timeline"
        guardado={guardadas.agenda ?? null}
        numero="02"
        seccion="agenda"
        titulo="Agenda de una Discucharla"
      >
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
      </TarjetaGuia>

      <TarjetaGuia
        {...comun}
        acento="#535E39"
        clase="guide-card-flow"
        claseCuerpo="guide-steps"
        guardado={guardadas.flow ?? null}
        numero="03"
        seccion="flow"
        titulo="Cómo funciona"
      >
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
      </TarjetaGuia>

      <TarjetaGuia
        {...comun}
        acento="#D49A3A"
        clase="guide-card-values"
        claseCuerpo="guide-values"
        guardado={guardadas.values ?? null}
        numero="04"
        seccion="values"
        titulo="Algunas cosas importantes"
      >
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
      </TarjetaGuia>
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
