import Link from "next/link";
import { FormularioAccion } from "@/components/admin/FormularioAccion";
import { BotonAccion } from "@/components/admin/BotonAccion";
import { Campo } from "@/components/ui/Campo";
import { masVotadas } from "@/lib/votaciones";
import {
  abrirVotacion,
  guardarVotacion,
  cerrarRonda,
  reabrirRonda,
  fijarGanadora,
} from "@/app/(admin)/admin/acciones";

export type PropuestaDelBanco = {
  id: string;
  titulo: string;
  podcast: string | null;
};

/**
 * `#clubAdminTools` del prototipo v2: todo lo que administración puede hacer
 * con la votación, guardado en un desplegable para que no coma pantalla.
 *
 * La UI se adapta al estado de la ronda, pero quien autoriza sigue siendo la
 * base: cada acción vuelve a comprobar la sesión y el rol.
 */
export function HerramientasVotacion({
  ronda,
  banco,
  candidatas,
  votos,
  titulos,
}: {
  ronda: { id: string; estado: string; titulo: string | null } | null;
  banco: PropuestaDelBanco[];
  candidatas: string[];
  votos: Map<string | null, number>;
  titulos: Map<string, string>;
}) {
  const abierta = ronda?.estado === "open";
  const cerrada = ronda?.estado === "closed";
  const tituloRonda = ronda?.titulo ?? null;
  const elegidas = new Set(candidatas);
  const { lideres } = masVotadas(votos);
  const hayEmpate = lideres.length > 1;
  const nombre = (id: string) => titulos.get(id) ?? "Propuesta";

  return (
    <details className="club-admin-tools" id="clubAdminTools">
      <summary>Administrar votación</summary>

      {cerrada && ronda && (
        <div id="clubWinnerAdmin" data-admin-only="panel">
          <FormularioAccion
            accion={fijarGanadora}
            clase="club-button secondary"
            id="clubSaveWinner"
            etiquetaEnvio="Guardar selección final"
          >
            <input type="hidden" name="ronda" value={ronda.id} />
            <label className="club-label" htmlFor="clubWinnerSelect">
              MODIFICAR RESULTADO · CONSERVA LOS VOTOS
            </label>
            <select className="form-input" defaultValue="" id="clubWinnerSelect" name="ganadora">
              <option disabled value="">
                Elige el episodio
              </option>
              {candidatas.map((id) => (
                <option key={id} value={id}>
                  {nombre(id)}
                </option>
              ))}
            </select>
            <Campo
              etiqueta="Nota"
              name="nota"
              maxLength={500}
              ayuda="Si eliges una distinta a la más votada, conviene explicar por qué."
            />
          </FormularioAccion>

          <Link className="club-button" href="/admin/discucharlas" id="clubWinnerToSession">
            Crear ficha del ganador seleccionado
          </Link>
        </div>
      )}

      <div className="club-panel" id="clubRoundAdmin" data-admin-only="panel">
        <div className="club-kicker">ADMINISTRACIÓN</div>

        <div className="club-actions">
          {cerrada && ronda && (
            <BotonAccion
              accion={reabrirRonda}
              campos={{ ronda: ronda.id }}
              clase="club-button"
              id="clubReopenRound"
              confirmacion="Se reabre esta votación con los votos que ya tenía y se borra el episodio elegido. ¿Seguimos?"
            >
              Reabrir votación
            </BotonAccion>
          )}
        </div>

        {!cerrada && (
          <div id="clubRoundBuilder">
            <h2 id="clubBuilderTitle">
              {abierta ? "Modificar votación actual" : "Crear nueva votación"}
            </h2>
            {abierta && (
              <p className="club-edit-warning" id="clubEditWarning">
                Los episodios que conserves mantienen sus votos y textos. Si retiras un episodio,
                también se retirarán sus votos de esta votación.
              </p>
            )}

            <FormularioAccion
              accion={abierta ? guardarVotacion : abrirVotacion}
              clase="club-button"
              id="clubOpenRound"
              etiquetaEnvio={abierta ? "Guardar cambios de la votación" : "Abrir votación"}
            >
              {ronda && <input type="hidden" name="ronda" value={ronda.id} />}
              <label className="club-label" htmlFor="clubRoundName">
                TÍTULO · OPCIONAL
              </label>
              <input
                className="form-input"
                defaultValue={tituloRonda ?? ""}
                id="clubRoundName"
                maxLength={200}
                name="titulo"
                placeholder="¿Qué escuchamos después?"
              />

              <h3>Elige los episodios participantes</h3>
              <div id="clubRoundChoices">
                {banco.length > 0 ? (
                  banco.map((p) => (
                    <label className="club-option" key={p.id}>
                      <input
                        defaultChecked={ronda ? elegidas.has(p.id) : true}
                        name="propuestas"
                        type="checkbox"
                        value={p.id}
                      />
                      <span>{p.titulo}</span>
                    </label>
                  ))
                ) : (
                  <p>Primero agrega una propuesta.</p>
                )}
              </div>
            </FormularioAccion>

            {!abierta && (
              <p className="club-muted">
                Hacen falta al menos dos episodios. Al abrirla, el club recibe aviso.
              </p>
            )}
          </div>
        )}

        {abierta && ronda && (
          <div id="clubRoundClose">
            <h3>Cerrar la votación</h3>
              {hayEmpate ? (
                <p className="club-message">
                  Hay empate entre {lideres.map(nombre).join(" y ")}. Elige cuál gana para poder
                  cerrar.
                </p>
              ) : (
                <p className="club-muted">
                  Si dejas la selección en blanco, gana la más votada. Elegir una distinta queda
                  registrado como decisión de administración.
                </p>
              )}
              <FormularioAccion
                accion={cerrarRonda}
                clase="club-button"
                id="clubCloseRound"
                etiquetaEnvio="Cerrar votación"
              >
                <input type="hidden" name="ronda" value={ronda.id} />
                <label className="club-label" htmlFor="ganadora">
                  SELECCIÓN FINAL
                </label>
                <select className="form-input" defaultValue="" id="ganadora" name="ganadora">
                  <option value="">La más votada</option>
                  {candidatas.map((id) => (
                    <option key={id} value={id}>
                      {nombre(id)}
                    </option>
                  ))}
                </select>
                <Campo
                  etiqueta="Nota"
                  name="nota"
                  maxLength={500}
                  ayuda="Si eliges una distinta a la más votada, conviene explicar por qué."
                />
              </FormularioAccion>
          </div>
        )}

        <p className="club-muted">
          Las opciones de una votación se conservan aunque después se edite o retire una propuesta.
          Para cambiar las opciones de la votación activa, utiliza Modificar votación actual.
        </p>
      </div>
    </details>
  );
}
