import ExcelJS from "exceljs";

/**
 * Construcción del .xlsx, sin acceso a datos.
 *
 * Vive aparte de exportar.ts para poder probarse sin base de datos ni contexto
 * de servidor: es la parte con más detalle y la que más fácil se rompe en
 * silencio.
 */

export const ESTADOS_EXPORTABLES = ["past", "cancelled", "draft"] as const;
export type EstadoExportable = (typeof ESTADOS_EXPORTABLES)[number];

export function leerEstados(valor: string | null): EstadoExportable[] {
  const pedidos = (valor ?? "past").split(",");
  const validos = ESTADOS_EXPORTABLES.filter((e) => pedidos.includes(e));
  return validos.length > 0 ? validos : ["past"];
}

export type Renglon = {
  id: string;
  episodio: string;
  podcast: string;
  fecha: string;
  inicio: string;
  fin: string;
  lugar: string;
  estado: string;
  enlace: string;
  resumen: string;
  asistentes: string;
  numeroAsistentes: number | "";
  calificacion: number | "";
  comentarios: number | "";
};

const COLUMNAS: { clave: keyof Renglon; titulo: string; ancho: number }[] = [
  { clave: "id", titulo: "ID Discucharla", ancho: 16 },
  { clave: "episodio", titulo: "Episodio", ancho: 40 },
  { clave: "podcast", titulo: "Podcast", ancho: 26 },
  { clave: "fecha", titulo: "Fecha", ancho: 14 },
  { clave: "inicio", titulo: "Hora de inicio", ancho: 14 },
  { clave: "fin", titulo: "Hora de fin", ancho: 14 },
  { clave: "lugar", titulo: "Lugar", ancho: 26 },
  { clave: "estado", titulo: "Estado", ancho: 14 },
  { clave: "enlace", titulo: "Enlace del episodio", ancho: 40 },
  { clave: "resumen", titulo: "Resumen", ancho: 56 },
  { clave: "asistentes", titulo: "Asistencia real", ancho: 44 },
  { clave: "numeroAsistentes", titulo: "Número de asistentes", ancho: 20 },
  { clave: "calificacion", titulo: "Calificación disponible", ancho: 20 },
  { clave: "comentarios", titulo: "Número de comentarios", ancho: 20 },
];

export const TITULOS = COLUMNAS.map((c) => c.titulo);
export const CLAVES = COLUMNAS.map((c) => c.clave);

export async function libroDelHistorial(renglones: Renglon[]) {
  const libro = new ExcelJS.Workbook();
  libro.creator = "Discucharlas";
  libro.created = new Date();

  const hoja = libro.addWorksheet("Discucharlas");
  hoja.columns = COLUMNAS.map((c) => ({ header: c.titulo, key: c.clave, width: c.ancho }));

  const encabezado = hoja.getRow(1);
  encabezado.font = { bold: true, color: { argb: "FFFBF6EE" } };
  encabezado.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF24152E" } };
  encabezado.alignment = { vertical: "middle" };
  encabezado.height = 22;

  for (const r of renglones) hoja.addRow(r);

  hoja.getColumn("resumen").alignment = { wrapText: true, vertical: "top" };
  hoja.getColumn("asistentes").alignment = { wrapText: true, vertical: "top" };
  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNAS.length } };
  hoja.views = [{ state: "frozen", ySplit: 1 }];

  return Buffer.from(await libro.xlsx.writeBuffer());
}
