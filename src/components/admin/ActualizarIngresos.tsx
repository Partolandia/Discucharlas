"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * `#entryRefresh` del prototipo. Aquí no hace falta para ver datos frescos
 * —cada navegación los relee— pero sí cuando otra administradora acaba de
 * crear un ingreso y quieres verlo sin salir de la pantalla.
 */
export function ActualizarIngresos() {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();

  return (
    <button
      className="entry-refresh club-back"
      disabled={pendiente}
      id="entryRefresh"
      type="button"
      onClick={() => empezar(() => router.refresh())}
    >
      {pendiente ? "Cargando ingresos…" : "Actualizar ingresos"}
    </button>
  );
}
