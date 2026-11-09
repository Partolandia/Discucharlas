"use client";

import { useActionState, useState } from "react";
import {
  editarClaveDeInvitadas,
  generarClaveDeInvitadas,
  type Resultado,
} from "@/app/(admin)/admin/acciones";
import { Aviso } from "@/components/ui/Aviso";

/**
 * `.guest-code-card` del prototipo: el código vigente, el editor en línea y la
 * confirmación antes de generar uno nuevo.
 *
 * El código se muestra porque se dicta en voz alta; la fila solo la leen
 * administradoras y el ingreso se sigue resolviendo contra su hash.
 */
export function ClaveDeInvitadas({ clave }: { clave: { id: string; codigo: string } | null }) {
  const [editar, accionEditar, editando] = useActionState<Resultado, FormData>(
    editarClaveDeInvitadas,
    {}
  );
  const [generar, accionGenerar, generando] = useActionState<Resultado, FormData>(
    generarClaveDeInvitadas,
    {}
  );
  const [vista, setVista] = useState<"normal" | "editar" | "confirmar">("normal");

  return (
    <section className="content-card guest-code-card">
      <h2>Acceso para invitados</h2>
      <p className="proposal-intro">
        Este código está activo para que cualquier persona invitada pueda ingresar y visualizar la
        información de la próxima Discucharla sin crear una cuenta.
      </p>

      <div className="guest-code-current">
        <span>Código vigente</span>
        <b id="guestCode">{clave ? clave.codigo || "Sin código visible" : "Sin código activo"}</b>
      </div>

      <div className="guest-code-actions">
        {clave && (
          <button
            className="mini-btn"
            data-admin-only="control"
            id="editGuestCodeBtn"
            type="button"
            onClick={() => setVista(vista === "editar" ? "normal" : "editar")}
          >
            Editar código
          </button>
        )}
        <button
          className="mini-btn primary"
          data-admin-only="control"
          id="changeGuestCodeBtn"
          type="button"
          onClick={() => setVista(vista === "confirmar" ? "normal" : "confirmar")}
        >
          Cambiar código
        </button>
      </div>

      {clave && (
        <form
          action={accionEditar}
          className="guest-code-editor"
          hidden={vista !== "editar"}
          id="guestCodeEditor"
        >
          <input type="hidden" name="clave" value={clave.id} />
          <label htmlFor="guestCodeInput">EDITAR CÓDIGO VIGENTE</label>
          <input
            autoComplete="off"
            className="form-input"
            defaultValue={clave.codigo}
            id="guestCodeInput"
            maxLength={40}
            name="codigo"
          />
          <div className="guest-code-editor-actions">
            <button
              className="mini-btn primary"
              data-admin-only="control"
              disabled={editando}
              id="saveGuestCodeEditBtn"
              type="submit"
            >
              Guardar
            </button>
            <button
              className="mini-btn"
              data-admin-only="control"
              id="cancelGuestCodeEditBtn"
              type="button"
              onClick={() => setVista("normal")}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <form
        action={accionGenerar}
        className="guest-code-confirm"
        hidden={vista !== "confirmar"}
        id="guestCodeConfirm"
      >
          <p>Al generar un nuevo código, el código actual dejará de funcionar. ¿Continuar?</p>
          <div className="guest-code-editor-actions">
            <button
              className="mini-btn primary"
              data-admin-only="control"
              disabled={generando}
              id="confirmChangeGuestCodeBtn"
              type="submit"
            >
              Sí, cambiar código
            </button>
            <button
              className="mini-btn"
              data-admin-only="control"
              id="cancelChangeGuestCodeBtn"
              type="button"
              onClick={() => setVista("normal")}
            >
              Cancelar
            </button>
          </div>
      </form>

      {(editar.error ?? editar.exito) && (
        <Aviso tono={editar.error ? "error" : "exito"}>{editar.error ?? editar.exito}</Aviso>
      )}
      {(generar.error ?? generar.exito) && (
        <Aviso tono={generar.error ? "error" : "exito"}>{generar.error ?? generar.exito}</Aviso>
      )}
    </section>
  );
}
