"use client";

import { useActionState, useRef } from "react";
import { guardarFotoDePerfil, type Resultado } from "@/app/(integrante)/club/acciones";

/** `#profilePhotoControls` del prototipo: cambiar o quitar la foto. */
export function FotoDePerfil({ tieneFoto }: { tieneFoto: boolean }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(guardarFotoDePerfil, {});
  const archivo = useRef<HTMLInputElement>(null);

  return (
    <form action={accion} id="profilePhotoControls">
      {/* Elegir archivo ya guarda: el prototipo no pide confirmar. */}
      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        id="profilePhotoInput"
        name="foto"
        ref={archivo}
        type="file"
        onChange={(e) => {
          if (e.target.files?.length) e.currentTarget.form?.requestSubmit();
        }}
      />

      <button
        disabled={pendiente}
        id="changeProfilePhotoBtn"
        type="button"
        onClick={() => archivo.current?.click()}
      >
        Cambiar foto
      </button>

      <button
        className="secondary"
        disabled={pendiente}
        hidden={!tieneFoto}
        id="removeProfilePhotoBtn"
        name="quitar"
        type="submit"
        value="1"
      >
        Quitar foto
      </button>

      {(estado.error ?? estado.exito) && (
        <p className="club-message" role="status" aria-live="polite">
          {estado.error ?? estado.exito}
        </p>
      )}
    </form>
  );
}
