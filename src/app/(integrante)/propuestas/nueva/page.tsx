import Link from "next/link";
import { exigirIntegrante } from "@/lib/sesion";
import { ProponerPodcast } from "@/components/propuestas/ProponerPodcast";

export const metadata = { title: "Nueva propuesta" };

export default async function NuevaPropuesta() {
  await exigirIntegrante();

  return (
    <section className="page active" id="proponer">
      <Link className="club-back" href="/propuestas" id="clubProposalBack">
        ‹ Volver a propuestas
      </Link>
      <div className="club-head">
        <span>EL PRÓXIMO EPISODIO</span>
        <h1 id="clubPropHeading">Proponer un podcast</h1>
      </div>
      <ProponerPodcast />
    </section>
  );
}
