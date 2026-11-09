export const SECCIONES_GUIA = ["intro", "agenda", "flow", "values"] as const;
export type SeccionGuia = (typeof SECCIONES_GUIA)[number];

/** Lo único que se puede escribir en la guía. Todo lo demás se cae. */
const ETIQUETAS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "span", "div",
  "time", "ul", "ol", "li", "h3", "h4", "a",
]);

/** Y los únicos atributos que sobreviven. */
const ATRIBUTOS = new Set(["class", "href"]);

/**
 * Deja el HTML de la guía en un subconjunto seguro.
 *
 * La guía la edita administración en el navegador y se guarda tal cual, así
 * que el cuerpo acaba siendo HTML escrito por una persona. Quien lo escribe es
 * de confianza, pero lo lee todo el club: se filtra en el servidor al guardar
 * para que una cuenta comprometida no pueda dejar un script dentro.
 */
export function sanearHtmlDeGuia(bruto: string): string {
  let html = bruto
    // Fuera lo que nunca debe entrar, con contenido y todo.
    .replace(/<(script|style|iframe|object|embed|form|input|svg)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|svg)\b[^>]*\/?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (_todo, cierre, etiqueta, resto) => {
    const nombre = String(etiqueta).toLowerCase();
    if (!ETIQUETAS.has(nombre)) return "";
    if (cierre) return `</${nombre}>`;

    const atributos: string[] = [];
    for (const [, clave, valor] of String(resto).matchAll(
      /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g
    )) {
      const nombreAtributo = clave?.toLowerCase();
      if (!nombreAtributo || !ATRIBUTOS.has(nombreAtributo)) continue;
      const limpio = (valor ?? "").replace(/"/g, "&quot;");
      if (nombreAtributo === "href" && !/^(https?:\/\/|\/|#|mailto:)/i.test(limpio)) continue;
      atributos.push(`${nombreAtributo}="${limpio}"`);
    }

    const cierreSolo = nombre === "br" ? " /" : "";
    return `<${nombre}${atributos.length ? " " + atributos.join(" ") : ""}${cierreSolo}>`;
  });

  return html.trim();
}
