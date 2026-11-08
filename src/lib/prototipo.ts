/**
 * Puente entre las rutas de la app y las pantallas del prototipo v2.
 *
 * El CSS del prototipo (src/estilos/prototipo-v2.css) selecciona por el id de
 * la pantalla (`#votacion`, `#archivo`…) y por `.phone[data-section]`. Para
 * poder reutilizarlo tal cual, cada ruta tiene que declarar con qué pantalla
 * del prototipo se corresponde.
 */
export type SeccionNav = "inicio" | "calendario" | "propuestas" | "comunidad" | "club";

export type Pantalla = {
  /** id del <section class="page"> en el prototipo */
  id: string;
  /** pestaña encendida y tema de la barra inferior */
  seccion: SeccionNav;
  /** texto de la barra superior; null = saludo con el nombre */
  titulo: string | null;
};

/** Tal como los define el objeto `names` del prototipo, ya con los parches v2. */
const RUTAS: Array<[string, Pantalla]> = [
  ["/inicio", { id: "inicio", seccion: "inicio", titulo: null }],
  ["/nuestras-discucharlas", { id: "archivo", seccion: "inicio", titulo: "Historial de Discucharlas" }],
  ["/guia", { id: "guia", seccion: "inicio", titulo: "Guía del club" }],
  ["/avisos", { id: "notificaciones", seccion: "inicio", titulo: "Notificaciones" }],
  ["/calendario", { id: "calendario", seccion: "calendario", titulo: "Calendario" }],
  ["/discucharla", { id: "sesion", seccion: "calendario", titulo: "Discucharla" }],
  ["/propuestas/votar", { id: "voto", seccion: "propuestas", titulo: "Resultados de votación" }],
  ["/propuestas/nueva", { id: "proponer", seccion: "propuestas", titulo: "Nueva propuesta" }],
  ["/propuestas/lista", { id: "club-proposals", seccion: "propuestas", titulo: "Propuestas" }],
  ["/propuestas/historial", { id: "club-history", seccion: "propuestas", titulo: "Historial de votaciones" }],
  ["/propuestas", { id: "votacion", seccion: "propuestas", titulo: "Propuestas y votaciones" }],
  ["/comunidad/nueva", { id: "nueva-conversacion", seccion: "comunidad", titulo: "Nueva conversación" }],
  ["/comunidad", { id: "comunidad", seccion: "comunidad", titulo: "Comunidad" }],
  ["/perfil", { id: "perfil", seccion: "club", titulo: "Perfil" }],
  ["/club", { id: "club", seccion: "club", titulo: "Club" }],
];

export function pantallaDe(ruta: string): Pantalla {
  // El orden importa: /propuestas/votar tiene que ganarle a /propuestas.
  for (const [prefijo, pantalla] of RUTAS) {
    if (ruta === prefijo || ruta.startsWith(`${prefijo}/`)) return pantalla;
  }
  return { id: "inicio", seccion: "inicio", titulo: null };
}

/** Las cinco pestañas de la barra inferior, en el orden del prototipo. */
export const PESTANAS: Array<{ pagina: string; seccion: SeccionNav; ruta: string; texto: string }> = [
  { pagina: "inicio", seccion: "inicio", ruta: "/inicio", texto: "Inicio" },
  { pagina: "calendario", seccion: "calendario", ruta: "/calendario", texto: "Calendario" },
  { pagina: "votacion", seccion: "propuestas", ruta: "/propuestas", texto: "Propuestas" },
  { pagina: "comunidad", seccion: "comunidad", ruta: "/comunidad", texto: "Comunidad" },
  { pagina: "club", seccion: "club", ruta: "/club", texto: "Club" },
];

/** Imágenes del prototipo, ya extraídas a /public/prototipo. */
export const IMAGENES = {
  logo: "/prototipo/02-a3854b25.webp",
  historial: "/prototipo/03-85a178fc.webp",
  guia: "/prototipo/04-c1d154d4.webp",
  calendario: "/prototipo/05-7c2bf2db.webp",
  votacion: "/prototipo/06-adc41fa6.webp",
  comunidad: "/prototipo/11-20524c0e.webp",
  club: "/prototipo/12-41dd732e.webp",
} as const;
