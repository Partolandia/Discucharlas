"use client";

import { useActionState } from "react";
import { abrirConversacion, type Resultado } from "@/app/(integrante)/comunidad/acciones";

export function AbrirConversacion() {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(abrirConversacion, {});

  return (
    <form action={accion}>
      <div className="community-form-card">
        <label htmlFor="titulo">TÍTULO</label>
        <input
          className="form-input"
          id="titulo"
          name="titulo"
          required
          maxLength={160}
          placeholder="Ej. ¿Qué están escuchando esta semana?"
        />
        <label htmlFor="cuerpo">MENSAJE</label>
        <textarea
          className="form-input community-textarea"
          id="cuerpo"
          name="cuerpo"
          required
          maxLength={4000}
          placeholder="Escribe un poco de contexto..."
        />
      </div>
      {estado.error && (
        <p className="club-message" role="status">
          {estado.error}
        </p>
      )}
      <button className="community-publish" type="submit" disabled={pendiente}>
        {pendiente ? "Publicando…" : "Publicar conversación"}
      </button>
    </form>
  );
}
