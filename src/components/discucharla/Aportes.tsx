"use client";

import { useActionState } from "react";
import {
  alternarAporte,
  guardarDetalleOtro,
  type Resultado,
} from "@/app/(integrante)/discucharla/acciones";
import { CATEGORIAS_APORTE } from "@/lib/dominio";
import { Aviso } from "@/components/ui/Aviso";
import { BotonEnviar } from "@/components/ui/BotonEnviar";

export function Aportes({
  sesion,
  misCategorias,
  detalleOtro,
}: {
  sesion: string;
  misCategorias: string[];
  detalleOtro: string | null;
}) {
  const [estado, alternar, pendiente] = useActionState<Resultado, FormData>(alternarAporte, {});
  const [estadoOtro, guardarOtro] = useActionState<Resultado, FormData>(guardarDetalleOtro, {});

  return (
    <div className="space-y-3">
      <h2 className="editorial text-[1.5rem]">¿Qué llevas?</h2>
      <p className="text-[15px] text-[var(--color-tinta-suave)]">
        Puedes elegir varias. Toca de nuevo para quitarla.
      </p>

      <form action={alternar}>
        <input type="hidden" name="sesion" value={sesion} />
        <fieldset disabled={pendiente} className="flex flex-wrap gap-2 pt-1">
          <legend className="sr-only">Categorías de aporte</legend>
          {CATEGORIAS_APORTE.map((c) => {
            const elegida = misCategorias.includes(c.valor);
            return (
              <button
                key={c.valor}
                type="submit"
                name="categoria"
                value={c.valor}
                aria-pressed={elegida}
                className={`rounded-full border px-4 py-2 text-[15px] transition ${
                  elegida
                    ? "border-transparent bg-[var(--color-calendario)] text-white"
                    : "border-[var(--color-linea)] bg-white/70 text-[var(--color-tinta)]"
                }`}
              >
                {c.texto}
              </button>
            );
          })}
        </fieldset>
        {estado.error && <div className="pt-2"><Aviso>{estado.error}</Aviso></div>}
      </form>

      {misCategorias.includes("otro") && (
        <form action={guardarOtro} className="space-y-2 pt-1">
          <input type="hidden" name="sesion" value={sesion} />
          <label htmlFor="detalle" className="block text-[15px] font-medium">
            ¿Qué otra cosa?
          </label>
          <input
            id="detalle"
            name="detalle"
            defaultValue={detalleOtro ?? ""}
            maxLength={120}
            placeholder="Un pastel de zanahoria"
            className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px]"
          />
          <BotonEnviar ocupado="Guardando…">Guardar</BotonEnviar>
          {estadoOtro.error && <Aviso>{estadoOtro.error}</Aviso>}
          {estadoOtro.exito && <Aviso tono="exito">{estadoOtro.exito}</Aviso>}
        </form>
      )}
    </div>
  );
}
