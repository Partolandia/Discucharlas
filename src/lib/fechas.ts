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

/** "8 nov, 9:20 a.m.": el sello que el prototipo pone en las solicitudes. */
export function fechaHoraCorta(fechaISO: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: ZONA_HORARIA_CLUB,
  }).format(comoFecha(fechaISO));
}

/** "19:00" a partir de un TIME de Postgres ("19:00:00"). */
export function hora(horaSQL: string | null) {
  if (!horaSQL) return null;
  const [h, m] = horaSQL.split(":");
  return `${Number(h)}:${m}`;
}

/** "6:00 PM": el formato que usa el prototipo en el hero y el calendario. */
export function hora12(horaSQL: string | null) {
  if (!horaSQL) return null;
  const [h, m] = horaSQL.split(":");
  const n = Number(h);
  return `${n % 12 || 12}:${m} ${n >= 12 ? "PM" : "AM"}`;
}

export function rangoHorario(inicio: string | null, fin: string | null) {
  const a = hora(inicio);
  const b = hora(fin);
  if (a && b) return `${a} a ${b}`;
  return a ?? null;
}

/** "Hace 1 hora", como lo escribe el prototipo en la vista previa de Comunidad. */
export function hace(cuando: string) {
  const minutos = Math.max(0, Math.round((Date.now() - Date.parse(cuando)) / 60000));
  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.round(horas / 24);
  if (dias < 7) return `Hace ${dias} ${dias === 1 ? "día" : "días"}`;
  const semanas = Math.round(dias / 7);
  return `Hace ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
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
