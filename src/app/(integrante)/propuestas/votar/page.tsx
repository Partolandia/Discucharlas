import Link from "next/link";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";
import { BloqueVotacion } from "@/components/propuestas/BloqueVotacion";

export const metadata = { title: "Votación" };

/**
 * Pantalla `#voto` del prototipo: la misma votación de `/propuestas`, a pantalla
 * completa. Comparte componente para que las dos no se separen nunca.
 */
export default async function Votar() {
  const perfil = await exigirIntegrante();

  return (
    <section className="page vote-screen-editorial active" id="voto">
      <Link className="club-back" href="/propuestas" id="clubVoteBack">
        ‹ Volver a propuestas
      </Link>

      <BloqueVotacion usuario={perfil.id} esAdmin={esAdministradora(perfil)} />
    </section>
  );
}
