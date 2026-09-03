/**
 * Comprueba que el .xlsx que se descarga es un archivo real, con las columnas
 * del brief, los datos en su sitio y sin inventar lo que nunca se registró.
 *
 *   npm run test:excel
 */
import assert from "node:assert/strict";
import { unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ExcelJS from "exceljs";
import { libroDelHistorial, leerEstados, TITULOS, type Renglon } from "../src/lib/exportar-libro.ts";

const RENGLONES: Renglon[] = [
  {
    id: "DC-0001",
    episodio: "Lo que no se hereda",
    podcast: "Radio Ambulante",
    fecha: "2026-08-07",
    inicio: "18:00",
    fin: "21:00",
    lugar: "Casa de Bea",
    estado: "Realizada",
    enlace: "https://open.spotify.com/",
    resumen: "Hablamos de las cosas que sí se heredan.",
    asistentes: "Ana Rivas, Bea Lomelí",
    numeroAsistentes: 2,
    calificacion: 4.5,
    comentarios: 3,
  },
  {
    // Una sesión cancelada de la que casi no se registró nada.
    id: "DC-0002",
    episodio: "La que no pudo ser",
    podcast: "Mar Abierto",
    fecha: "",
    inicio: "",
    fin: "",
    lugar: "",
    estado: "Cancelada",
    enlace: "",
    resumen: "",
    asistentes: "",
    numeroAsistentes: 0,
    calificacion: "",
    comentarios: "",
  },
];

function prueba(nombre: string, fn: () => void | Promise<void>) {
  return Promise.resolve(fn()).then(
    () => console.log(`ok   ${nombre}`),
    (e) => {
      console.error(`FALLA ${nombre}\n      ${e.message}`);
      process.exitCode = 1;
    }
  );
}

// --- selección de estados ----------------------------------------------------
await prueba("sin parámetro se exportan solo las realizadas", () => {
  assert.deepEqual(leerEstados(null), ["past"]);
});

await prueba("se respetan varios estados y se ignora la basura", () => {
  assert.deepEqual(leerEstados("cancelled,past,inventado"), ["past", "cancelled"]);
});

await prueba("un filtro vacío no deja el archivo sin filas", () => {
  assert.deepEqual(leerEstados("inventado"), ["past"]);
});

// --- el archivo --------------------------------------------------------------
const binario = await libroDelHistorial(RENGLONES);

await prueba("el archivo es un .xlsx real, no un csv disfrazado", () => {
  // Un xlsx es un zip: empieza con "PK".
  assert.equal(binario.subarray(0, 2).toString(), "PK");
  assert.ok(binario.length > 4000, `pesa muy poco: ${binario.length} bytes`);
});

const leido = new ExcelJS.Workbook();
await leido.xlsx.load(binario as unknown as ArrayBuffer);
const hoja = leido.getWorksheet("Discucharlas")!;

await prueba("se puede volver a abrir y trae la hoja esperada", () => {
  assert.ok(hoja, "no hay hoja Discucharlas");
  assert.equal(hoja.rowCount, RENGLONES.length + 1);
});

await prueba("están las catorce columnas del brief, en orden", () => {
  const encabezados = (hoja.getRow(1).values as (string | undefined)[]).slice(1);
  assert.deepEqual(encabezados, TITULOS);
});

await prueba("los datos caen en su columna", () => {
  const fila = hoja.getRow(2);
  assert.equal(fila.getCell(1).value, "DC-0001");
  assert.equal(fila.getCell(2).value, "Lo que no se hereda");
  assert.equal(fila.getCell(8).value, "Realizada");
  assert.equal(fila.getCell(11).value, "Ana Rivas, Bea Lomelí");
  assert.equal(fila.getCell(13).value, 4.5);
});

await prueba("lo que nunca se registró va en blanco, no inventado", () => {
  const fila = hoja.getRow(3);
  for (const columna of [4, 5, 6, 7, 9, 10, 11, 13, 14]) {
    const valor = fila.getCell(columna).value;
    assert.ok(
      valor === null || valor === undefined || valor === "",
      `la columna ${columna} trae "${valor}" en vez de ir vacía`
    );
  }
});

await prueba("las notas privadas no aparecen por ningún lado", () => {
  assert.ok(!TITULOS.some((t) => /nota/i.test(t)));
});

// --- que Excel de verdad lo acepte -------------------------------------------
await prueba("el zip no está corrupto", () => {
  const ruta = "/tmp/prueba-historial.xlsx";
  writeFileSync(ruta, binario);
  try {
    const contenido = execFileSync("unzip", ["-l", ruta], { encoding: "utf8" });
    assert.match(contenido, /xl\/worksheets\/sheet1\.xml/);
    assert.match(contenido, /\[Content_Types\]\.xml/);
  } finally {
    unlinkSync(ruta);
  }
});

if (!process.exitCode) console.log("\nTODAS LAS PRUEBAS DE EXPORTACIÓN PASARON");
