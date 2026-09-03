"use client";

import { useActionState, useState } from "react";
import { abrirConversacion, type Resultado } from "@/app/(integrante)/comunidad/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function AbrirConversacion() {
  const [estado, accion] = useActionState<Resultado, FormData>(abrirConversacion, {});
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
      <button
        onClick={() => setAbierto(true)}
        className="flex w-full items-center gap-3 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] px-4 py-4 text-left"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[18px] text-white"
          style={{ background: "var(--color-comunidad)" }}
        >
          +
        </span>
        <span className="text-[15px] font-medium">Abrir una conversación</span>
      </button>
    );
  }

  return (
    <form
      action={accion}
      className="space-y-4 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-[var(--color-blanco)] p-5"
    >
      <Campo
        etiqueta="¿De qué quieres hablar?"
        name="titulo"
        required
        maxLength={160}
        placeholder="¿Qué están escuchando esta semana?"
      />
      <div className="space-y-1.5">
        <label htmlFor="cuerpo" className="block text-[15px] font-medium">
          Cuéntanos
        </label>
        <textarea
          id="cuerpo"
          name="cuerpo"
          rows={4}
          required
          maxLength={4000}
          className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
        />
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}

      <BotonEnviar ocupado="Publicando…">Abrir conversación</BotonEnviar>
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
