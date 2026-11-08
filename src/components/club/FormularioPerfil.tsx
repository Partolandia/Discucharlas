"use client";

import { useActionState } from "react";
import { guardarPerfil, type Resultado } from "@/app/(integrante)/club/acciones";
import type { Perfil } from "@/lib/sesion";

export function FormularioPerfil({ perfil }: { perfil: Perfil }) {
  const [estado, accion, pendiente] = useActionState<Resultado, FormData>(guardarPerfil, {});

  return (
    <form action={accion} className="content-card profile-edit-card">
      <div className="profile-edit-head">
        <div>
          <span className="mini-kicker">MI CUENTA</span>
          <h2>Editar perfil</h2>
          <p>
            Estos son los datos que forman parte de tu cuenta. Correo y teléfono no se muestran en
            tu perfil público.
          </p>
        </div>
      </div>

      <div className="profile-edit-grid">
        <label>
          Nombre
          <input
            className="form-input"
            name="nombre"
            type="text"
            autoComplete="given-name"
            defaultValue={perfil.first_name}
            required
            maxLength={80}
          />
        </label>
        <label>
          Apellido
          <input
            className="form-input"
            name="apellido"
            type="text"
            autoComplete="family-name"
            defaultValue={perfil.last_name ?? ""}
            maxLength={80}
          />
        </label>
        <label>
          Teléfono
          <input
            className="form-input"
            name="telefono"
            type="tel"
            autoComplete="tel"
            defaultValue={perfil.phone ?? ""}
            maxLength={40}
          />
        </label>
        <label>
          Cumpleaños · día
          <input
            className="form-input"
            name="dia"
            type="number"
            min={1}
            max={31}
            defaultValue={perfil.birthday_day ?? ""}
          />
        </label>
        <label>
          Cumpleaños · mes
          <input
            className="form-input"
            name="mes"
            type="number"
            min={1}
            max={12}
            defaultValue={perfil.birthday_month ?? ""}
          />
        </label>
        <label className="profile-edit-wide">
          Sobre ti
          <textarea
            className="form-input"
            name="bio"
            rows={3}
            maxLength={1000}
            defaultValue={perfil.bio ?? ""}
          />
        </label>
        <label className="profile-edit-wide">
          Intereses / gustos
          <textarea
            className="form-input"
            name="intereses"
            rows={3}
            maxLength={1000}
            defaultValue={perfil.interests ?? ""}
            placeholder="La historia oral, el cine iraní, cocinar sin receta…"
          />
        </label>
      </div>

      <label className="setting-row">
        <input
          type="checkbox"
          name="avisos"
          value="si"
          defaultChecked={perfil.email_notifications}
        />
        <span>
          Quiero avisos por correo cuando se agende una discucharla o se abra una votación.
        </span>
      </label>

      {(estado.error ?? estado.exito) && (
        <p className="club-message" role="status" aria-live="polite">
          {estado.error ?? estado.exito}
        </p>
      )}

      <div className="profile-edit-actions">
        <button className="new" type="submit" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
