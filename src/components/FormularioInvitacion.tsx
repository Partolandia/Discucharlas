"use client";

import { useActionState } from "react";
import { aceptarInvitacion, type Resultado } from "@/app/invitacion/acciones";
import { Aviso } from "@/components/ui/Aviso";

export function FormularioInvitacion({ token, nombre }: { token: string; nombre: string }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(aceptarInvitacion, {});

  return (
    <form action={accion} className="member-invite-form-card">
      <input type="hidden" name="token" value={token} />

      <div className="member-invite-form-head">
        <div>
          <div className="eyebrow">CREAR TU CUENTA</div>
          <h2>Cuéntanos de ti</h2>
        </div>
        <span className="member-invite-step">1 / 1</span>
      </div>
      <p className="member-invite-form-intro">
        Los datos con * son necesarios para crear tu cuenta.
      </p>

      <div className="member-invite-grid two">
        <label>
          Nombre*
          <input
            className="form-input"
            name="nombre"
            autoComplete="given-name"
            defaultValue={nombre}
            required
            maxLength={80}
          />
        </label>
        <label>
          Apellido
          <input
            className="form-input"
            name="apellido"
            autoComplete="family-name"
            maxLength={80}
          />
        </label>
      </div>

      <label>
        Teléfono / WhatsApp*
        <input className="form-input" name="telefono" type="tel" autoComplete="tel" required maxLength={40} />
        <small>Solo lo ven las administradoras del club.</small>
      </label>

      <div className="member-invite-grid two">
        <label>
          Contraseña*
          <input
            className="form-input"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirmar contraseña*
          <input
            className="form-input"
            name="confirmacion"
            type="password"
            autoComplete="new-password"
            required
          />
        </label>
      </div>
      <small>Al menos 8 caracteres.</small>

      {estado.error && <Aviso>{estado.error}</Aviso>}

      <button className="new member-invite-create" type="submit" disabled={pendiente}>
        {pendiente ? "Creando tu cuenta…" : "Crear mi cuenta"}
      </button>
    </form>
  );
}
