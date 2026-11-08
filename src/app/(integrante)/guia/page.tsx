import { exigirIntegrante } from "@/lib/sesion";
import { PantallaGuia } from "@/components/prototipo/PantallaGuia";

export const metadata = { title: "Guía del club" };

export default async function Guia() {
  await exigirIntegrante();
  return <PantallaGuia />;
}
