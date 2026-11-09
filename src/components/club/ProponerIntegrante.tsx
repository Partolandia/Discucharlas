"use client";

import { useActionState } from "react";
import { proponerIntegrante, type Resultado } from "@/app/(integrante)/club/acciones";
import { Aviso } from "@/components/ui/Aviso";

export function ProponerIntegrante() {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(proponerIntegrante, {});

  return (
    <form action={accion}>
      <div className="form-card">
        <label htmlFor="inviteRequestName">NOMBRE DE LA PERSONA</label>
        <input
          className="form-input"
          id="inviteRequestName"
          name="nombre"
          required
          maxLength={120}
          placeholder="Nombre y apellido"
        />
        <label htmlFor="email">CORREO · OPCIONAL</label>
        <input className="form-input" id="email" name="email" type="email" />
        <label htmlFor="inviteRequestContext">CONTEXTO OPCIONAL</label>
        <textarea
          className="form-input"
          id="inviteRequestContext"
          name="nota"
          maxLength={1000}
          placeholder="Ej. amiga del trabajo interesada en podcasts de cultura, o la conocí en…"
        />
        <p className="role-note">
          La persona no recibe acceso automáticamente. Primero llega la solicitud a administración
          y, una vez aprobada, se genera el link individual para compartirlo manualmente.
        </p>
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.exito && <Aviso tono="exito">{estado.exito}</Aviso>}

      <button className="new" id="submitInviteRequestBtn" type="submit" disabled={pendiente}>
        {pendiente ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
