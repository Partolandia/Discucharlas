"use client";

import { useActionState, useState } from "react";
import { proponerPodcast, type Resultado } from "@/app/(integrante)/propuestas/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function ProponerPodcast() {
  const [estado, accion] = useActionState<Resultado, FormData>(proponerPodcast, {});
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
          className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-[var(--color-blanco)] px-5 py-4 text-[15px] font-medium"
        >
          + Proponer un nuevo podcast
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
      <Campo etiqueta="Episodio" name="episodio" required maxLength={200} placeholder="La física del duelo" />
      <Campo etiqueta="Podcast" name="podcast" required maxLength={160} placeholder="Radio Ambulante" />
      <Campo etiqueta="Enlace para escucharlo" name="url" type="url" placeholder="https://open.spotify.com/…" />
      <Campo etiqueta="Duración" name="duracion" maxLength={40} placeholder="28 min" />

      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="block text-[15px] font-medium">
          ¿Por qué lo propones?
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          maxLength={2000}
          placeholder="Una historia sobre pérdida y las formas en que la atravesamos."
          className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
        />
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}

      <div className="flex gap-3">
        <BotonEnviar ocupado="Guardando…">Proponer</BotonEnviar>
      </div>
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
