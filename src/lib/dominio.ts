/**
 * Vocabulario del club. El copy visible sale de aquí para que la interfaz
 * hable como el documento maestro y no como la base de datos.
 */

export const RESPUESTAS_RSVP = [
  { valor: "yes", texto: "¡Cuenta conmigo!", color: "var(--color-propuestas)" },
  { valor: "maybe", texto: "Aún no sé", color: "var(--color-club)" },
  { valor: "no", texto: "Lo siento, no puedo", color: "var(--color-tinta-suave)" },
] as const;

export type RespuestaRsvp = (typeof RESPUESTAS_RSVP)[number]["valor"];

export const CATEGORIAS_APORTE = [
  { valor: "bebida", texto: "Bebida" },
  { valor: "fruta", texto: "Fruta" },
  { valor: "botana_salada", texto: "Botana salada" },
  { valor: "botana_dulce", texto: "Botana dulce" },
  { valor: "ensalada", texto: "Ensalada" },
  { valor: "pan", texto: "Pan" },
  { valor: "otro", texto: "Otro" },
] as const;

export type CategoriaAporte = (typeof CATEGORIAS_APORTE)[number]["valor"];

export const ESTADOS_SESION = {
  draft: { texto: "Borrador", color: "var(--color-tinta-suave)" },
  upcoming: { texto: "Próxima", color: "var(--color-inicio)" },
  past: { texto: "Realizada", color: "var(--color-propuestas)" },
  cancelled: { texto: "Cancelada", color: "var(--color-error)" },
} as const;

export type EstadoSesion = keyof typeof ESTADOS_SESION;

export function textoRsvp(valor: string | null | undefined) {
  return RESPUESTAS_RSVP.find((r) => r.valor === valor)?.texto ?? null;
}

export function textoAporte(valor: string) {
  return CATEGORIAS_APORTE.find((c) => c.valor === valor)?.texto ?? valor;
}
