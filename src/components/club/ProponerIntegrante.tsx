"use client";

import { useActionState, useState } from "react";
import { proponerIntegrante, type Resultado } from "@/app/(integrante)/club/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function ProponerIntegrante() {
  const [estado, accion] = useActionState<Resultado, FormData>(proponerIntegrante, {});
  const [abierto, setAbierto] = useState(false);
  // Al cerrar, el formulario se desmonta y vuelve limpio, así que no hace
  // falta resetearlo a mano. Ajustamos el estado en render en vez de en un
  // efecto: es el patrón que React recomienda para reaccionar a un cambio.
  const [exitoVisto, setExitoVisto] = useState<string | undefined>(undefined);
  if (estado.exito !== exitoVisto) {
    setExitoVisto(estado.exito);
    if (estado.exito) setAbierto(false);
  }

  if (!abierto) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setAbierto(true)}
          className="flex w-full items-center gap-3 rounded-[var(--radius-tarjeta)] px-4 py-4 text-left"
          style={{ background: "var(--color-club-suave)" }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-[19px] text-white"
            style={{ background: "var(--color-club)" }}
          >
            +
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-[15px] font-medium"
              style={{ color: "var(--color-club-fuerte)" }}
            >
              Proponer nueva integrante
            </span>
            <span className="mt-0.5 block text-[13px] text-[var(--color-tinta-suave)]">
              Invita a alguien de tu confianza a sumarse al club
            </span>
          </span>
          <span aria-hidden className="text-[var(--color-tinta-suave)]">
            ›
          </span>
        </button>
        {estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}
      </div>
    );
  }

  return (
    <form
      action={accion}
      className="space-y-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
    >
      <p className="text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
        Tu propuesta llega a administración, que decide si le manda invitación.
      </p>
      <Campo etiqueta="¿Cómo se llama?" name="nombre" required maxLength={120} />
      <Campo etiqueta="Su correo (opcional)" name="email" type="email" />
      <div className="space-y-1.5">
        <label htmlFor="nota" className="block text-[15px] font-medium">
          ¿Por qué la propones?
        </label>
        <textarea
          id="nota"
          name="nota"
          rows={3}
          maxLength={1000}
          className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
        />
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}

      <BotonEnviar ocupado="Enviando…">Proponer</BotonEnviar>
      <button
        type="button"
        onClick={() => setAbierto(false)}
        className="w-full text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Cancelar
      </button>
    </form>
  );
}
