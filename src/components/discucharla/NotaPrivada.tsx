"use client";

import { useActionState } from "react";
import { guardarNotaPrivada, type Resultado } from "@/app/(integrante)/discucharla/acciones";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";

export function NotaPrivada({ sesion, nota }: { sesion: string; nota: string }) {
  const [estado, accion] = useActionState<Resultado, FormData>(guardarNotaPrivada, {});

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="sesion" value={sesion} />
      <div>
        <h2 className="editorial text-[1.5rem]">Mis notas</h2>
        <p className="mt-1 text-[15px] text-[var(--color-tinta-suave)]">
          Solo tú las ves. Ni las demás integrantes ni las administradoras.
        </p>
      </div>
      <textarea
        name="texto"
        defaultValue={nota}
        rows={6}
        placeholder="Lo que te movió, lo que quieres decir, lo que no quieres olvidar…"
        className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
      />
      <BotonEnviar ocupado="Guardando…">Guardar nota</BotonEnviar>
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}
    </form>
  );
}
