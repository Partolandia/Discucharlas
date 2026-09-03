"use client";

import { useActionState } from "react";
import { guardarPerfil, type Resultado } from "@/app/(integrante)/club/acciones";
import { Campo } from "@/components/ui/Campo";
import { BotonEnviar } from "@/components/ui/BotonEnviar";
import { Aviso } from "@/components/ui/Aviso";
import type { Perfil } from "@/lib/sesion";

export function FormularioPerfil({ perfil }: { perfil: Perfil }) {
  const [estado, accion] = useActionState<Resultado, FormData>(guardarPerfil, {});

  return (
    <form action={accion} className="space-y-5">
      <Campo etiqueta="Nombre" name="nombre" defaultValue={perfil.first_name} required maxLength={80} />
      <Campo etiqueta="Apellido" name="apellido" defaultValue={perfil.last_name ?? ""} maxLength={80} />
      <Campo
        etiqueta="Teléfono"
        name="telefono"
        type="tel"
        defaultValue={perfil.phone ?? ""}
        maxLength={40}
        ayuda="Solo lo ven las administradoras del club."
      />

      <div className="space-y-1.5">
        <label htmlFor="bio" className="block text-[15px] font-medium">
          Sobre ti
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={1000}
          defaultValue={perfil.bio ?? ""}
          className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="intereses" className="block text-[15px] font-medium">
          Le interesa
        </label>
        <textarea
          id="intereses"
          name="intereses"
          rows={2}
          maxLength={1000}
          defaultValue={perfil.interests ?? ""}
          placeholder="La historia oral, el cine iraní, cocinar sin receta…"
          className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] leading-relaxed"
        />
        <p className="text-[14px] text-[var(--color-tinta-suave)]">
          Escríbelo seguido, como lo dirías en voz alta.
        </p>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-[15px] font-medium">Cumpleaños</legend>
        <p className="text-[14px] text-[var(--color-tinta-suave)]">
          Se comparte el día y el mes; el año no.
        </p>
        <div className="flex gap-3 pt-1">
          <input
            name="dia"
            type="number"
            min={1}
            max={31}
            defaultValue={perfil.birthday_day ?? ""}
            aria-label="Día"
            placeholder="Día"
            className="w-24 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px]"
          />
          <input
            name="mes"
            type="number"
            min={1}
            max={12}
            defaultValue={perfil.birthday_month ?? ""}
            aria-label="Mes"
            placeholder="Mes"
            className="w-24 rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px]"
          />
        </div>
      </fieldset>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="avisos"
          value="si"
          defaultChecked={perfil.email_notifications}
          className="mt-1 h-5 w-5 shrink-0"
        />
        <span className="text-[15px] leading-relaxed">
          Quiero avisos por correo cuando se agende una discucharla o se abra una votación.
        </span>
      </label>

      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}

      <BotonEnviar ocupado="Guardando…">Guardar perfil</BotonEnviar>
    </form>
  );
}
