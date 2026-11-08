import "@/estilos/prototipo.css";
import { notFound } from "next/navigation";
import { Cascaron } from "@/components/prototipo/Cascaron";
import { PantallaInicio } from "@/components/prototipo/PantallaInicio";
import { PantallaCalendario } from "@/components/prototipo/PantallaCalendario";
import { PantallaPropuestas } from "@/components/prototipo/PantallaPropuestas";
import { PantallaComunidad } from "@/components/prototipo/PantallaComunidad";
import { PantallaClub } from "@/components/prototipo/PantallaClub";
import { pantallaDe } from "@/lib/prototipo";

/**
 * Vista previa del port del prototipo v2, con datos inventados.
 *
 * Existe para revisar las pantallas sin levantar Supabase ni tener cuenta. No
 * se publica: en producción responde 404.
 */
export const dynamic = "force-static";

const RUTA_DE: Record<string, string> = {
  inicio: "/inicio",
  calendario: "/calendario",
  propuestas: "/propuestas",
  comunidad: "/comunidad",
  club: "/club",
};

export function generateStaticParams() {
  return Object.keys(RUTA_DE).map((seccion) => ({ seccion }));
}

export default async function VistaPrevia({
  params,
}: {
  params: Promise<{ seccion: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { seccion } = await params;
  const ruta = RUTA_DE[seccion];
  if (!ruta) notFound();

  return (
    <Cascaron nombre="Isa" inicial="I" esAdmin pantallaForzada={pantallaDe(ruta)}>
      {seccion === "inicio" && (
        <PantallaInicio
          sesion={{
            id: "demo",
            titulo: "Democratizar el privilegio intelectual",
            meta: ["Viernes 21 de agosto · 6:00 PM", "Casa de Tessie · Tlacoquemécatl"],
            enlace: "https://example.com",
          }}
          realizadas={11}
          propuestas={7}
          votacionAbierta
          hilos={[
            {
              id: "demo",
              titulo: "¿Qué están escuchando esta semana?",
              cuerpo: "Busco algo ligero pero con carnita para un viaje largo.",
              iniciales: "MJ",
              pie: "6 respuestas · Hace 1 hora",
            },
          ]}
        />
      )}

      {seccion === "calendario" && (
        <PantallaCalendario
          esAdmin
          mesInicial="2026-08"
          sesiones={[
            { id: "a", titulo: "Gestación subrogada", fecha: "2026-08-07", hora: "6:00 PM", lugar: "Casa de Dalia", estado: "past" },
            { id: "b", titulo: "Democratizar el privilegio intelectual", fecha: "2026-08-21", hora: "6:00 PM", lugar: "Casa de Tessie", estado: "upcoming" },
            { id: "c", titulo: "El costo de cuidar", fecha: "2026-08-28", hora: null, lugar: null, estado: "cancelled" },
          ]}
        />
      )}

      {seccion === "propuestas" && (
        <PantallaPropuestas
          propuestas={7}
          votacion={{ titulo: "¿Qué escuchamos después?", abierta: true, candidaturas: 4 }}
          esAdmin
        />
      )}

      {seccion === "comunidad" && (
        <PantallaComunidad
          hilos={[
            {
              id: "a",
              iniciales: "MJ",
              cuando: "Hace 1 hora",
              titulo: "¿Qué están escuchando esta semana?",
              autor: "Majo",
              cuerpo: "Busco algo ligero pero con carnita para un viaje largo.",
              respuestas: 6,
              corazones: 8,
            },
            {
              id: "b",
              iniciales: "TS",
              cuando: "Ayer",
              titulo: "Libro que salió en la última sesión",
              autor: "Tessie",
              cuerpo: "Dejo aquí el enlace para que no se nos pierda.",
              respuestas: 3,
              corazones: 5,
            },
          ]}
        />
      )}

      {seccion === "club" && (
        <PantallaClub
          realizadas={11}
          integrantes={[
            { id: "1", nombre: "Isa", iniciales: "IG", acento: "#8e79ad", epigrafe: "TU PERFIL · ADMINISTRADOR", detalle: "Ver y editar perfil", esMio: true },
            { id: "2", nombre: "Tessie", iniciales: "TS", acento: "#61758d", epigrafe: "INTEGRANTE", detalle: "11 Discucharlas · Ver perfil", esMio: false },
            { id: "3", nombre: "Dalia", iniciales: "DA", acento: "#c98389", epigrafe: "INTEGRANTE", detalle: "7 Discucharlas · Ver perfil", esMio: false },
            { id: "4", nombre: "Majo", iniciales: "MJ", acento: "#f05d50", epigrafe: "INTEGRANTE", detalle: "9 Discucharlas · Ver perfil", esMio: false },
          ]}
        />
      )}
    </Cascaron>
  );
}
