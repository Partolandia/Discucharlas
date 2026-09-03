import { NextResponse, type NextRequest } from "next/server";
import { perfilActual, esAdministradora } from "@/lib/sesion";
import { renglonesDelHistorial } from "@/lib/exportar";
import { leerEstados, libroDelHistorial } from "@/lib/exportar-libro";

/**
 * Descarga del historial en .xlsx.
 *
 * Va por su propia ruta porque devuelve un archivo, no una pantalla, así que
 * comprueba el permiso a mano: una server action no puede entregar un binario.
 */
export async function GET(peticion: NextRequest) {
  const perfil = await perfilActual();
  if (!esAdministradora(perfil)) {
    return new NextResponse("No autorizado", { status: 403 });
  }

  const estados = leerEstados(peticion.nextUrl.searchParams.get("estados"));
  const renglones = await renglonesDelHistorial(estados);
  const libro = await libroDelHistorial(renglones);

  const fecha = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(libro), {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="discucharlas-${fecha}.xlsx"`,
      "cache-control": "no-store",
    },
  });
}
