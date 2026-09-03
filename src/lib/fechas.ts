import { ZONA_HORARIA_CLUB } from "@/lib/entorno";

/**
 * Las fechas se guardan en UTC y se muestran en la zona del club.
 * `sessions.date` es un DATE puro: al formatearlo hay que anclarlo a mediodía
 * para que el cambio de zona no lo mueva de día.
 */
function comoFecha(fechaISO: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fechaISO)
    ? new Date(`${fechaISO}T12:00:00Z`)
    : new Date(fechaISO);
}

export function fechaLarga(fechaISO: string) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZONA_HORARIA_CLUB,
  }).format(comoFecha(fechaISO));
}

export function fechaCorta(fechaISO: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: ZONA_HORARIA_CLUB,
  }).format(comoFecha(fechaISO));
}

/** "19:00" a partir de un TIME de Postgres ("19:00:00"). */
export function hora(horaSQL: string | null) {
  if (!horaSQL) return null;
  const [h, m] = horaSQL.split(":");
  return `${Number(h)}:${m}`;
}

export function rangoHorario(inicio: string | null, fin: string | null) {
  const a = hora(inicio);
  const b = hora(fin);
  if (a && b) return `${a} a ${b}`;
  return a ?? null;
}

/** Días completos que faltan para una fecha, en la zona del club. */
export function diasFaltantes(fechaISO: string) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA_CLUB }).format(new Date());
  const dia = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(`${fechaISO}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / dia);
}

export function cuentaRegresiva(fechaISO: string) {
  const dias = diasFaltantes(fechaISO);
  if (dias < 0) return "ya pasó";
  if (dias === 0) return "es hoy";
  if (dias === 1) return "es mañana";
  return `faltan ${dias} días`;
}
