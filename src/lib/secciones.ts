/**
 * Identidad de cada destino, según el prototipo V135.
 *
 * Inicio es la excepción deliberada del sistema: su cabecera no lleva color
 * (saluda sobre papel) porque el hero de la próxima discucharla ya tiene
 * suficiente fuerza. Su pestaña sí usa la berenjena de marca, y el coral queda
 * para las acciones.
 */
/** Cómo encuadra el collage en el encabezado (V135). */
export type ModoEncabezado = "fondo" | "rejilla" | "banda" | "texto";

export const SECCIONES = {
  inicio: {
    ruta: "/inicio",
    nav: "Inicio",
    color: "var(--color-tinta)",
    tinte: "var(--color-tinta)",
    cabeceraConColor: false,
  },
  calendario: {
    ruta: "/calendario",
    nav: "Calendario",
    titulo: "Calendario",
    color: "var(--color-calendario)",
    tinte: "var(--color-calendario-fuerte)",
    cabeceraConColor: true,
    eyebrow: "Próximos encuentros",
    encabezado: "Calendario del club",
    entrada: "Consulta las fechas del club y entra al detalle de cada discucharla.",
    fondo: "var(--color-calendario-suave)",
    modoEncabezado: "fondo" as ModoEncabezado,
  },
  propuestas: {
    ruta: "/propuestas",
    nav: "Propuestas",
    titulo: "Propuestas y votaciones",
    color: "var(--color-propuestas)",
    tinte: "var(--color-propuestas-fuerte)",
    cabeceraConColor: true,
    eyebrow: "La próxima conversación",
    encabezado: "Propuestas",
    entrada: "Propón podcasts, participa en las votaciones y consulta los resultados.",
    fondo: "transparent",
    modoEncabezado: "texto" as ModoEncabezado,
  },
  comunidad: {
    ruta: "/comunidad",
    nav: "Comunidad",
    titulo: "Comunidad",
    color: "var(--color-comunidad)",
    tinte: "var(--color-comunidad-fuerte)",
    cabeceraConColor: true,
    eyebrow: "Entre nosotras",
    encabezado: "Comunidad",
    entrada: "Ideas, preguntas y hallazgos que seguimos compartiendo.",
    fondo: "var(--color-comunidad-crema)",
    modoEncabezado: "rejilla" as ModoEncabezado,
  },
  club: {
    ruta: "/club",
    nav: "Club",
    titulo: "Club",
    color: "var(--color-club)",
    tinte: "var(--color-club-fuerte)",
    cabeceraConColor: true,
    eyebrow: "Nuestro círculo",
    encabezado: "Integrantes",
    entrada: null,
    fondo: "var(--color-club-medio)",
    modoEncabezado: "banda" as ModoEncabezado,
  },
} as const;

export type ClaveSeccion = keyof typeof SECCIONES;

/** Qué sección corresponde a una ruta. Las subpáginas heredan su origen. */
export function seccionDe(ruta: string): ClaveSeccion {
  if (ruta.startsWith("/calendario") || ruta.startsWith("/discucharla")) return "calendario";
  if (ruta.startsWith("/propuestas")) return "propuestas";
  if (ruta.startsWith("/comunidad")) return "comunidad";
  if (ruta.startsWith("/club") || ruta.startsWith("/perfil")) return "club";
  if (ruta.startsWith("/nuestras-discucharlas") || ruta.startsWith("/guia")) return "inicio";
  return "inicio";
}

export const ORDEN_NAV: ClaveSeccion[] = ["inicio", "calendario", "propuestas", "comunidad", "club"];
