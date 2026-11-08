"use client";

import { useRouter } from "next/navigation";
import { IMAGENES } from "@/lib/prototipo";
import { Backline } from "@/components/prototipo/Backline";

const MOSAICOS = [
  {
    ruta: "/admin/accesos",
    imagen: IMAGENES.adminAccesos,
    titulo: "Accesos",
    texto: "Nuevos integrantes y acceso de invitados",
  },
  {
    ruta: "/admin/integrantes",
    imagen: IMAGENES.adminIntegrantes,
    titulo: "Integrantes",
    texto: "Cuentas, estados y roles",
  },
  {
    ruta: "/admin/votacion",
    imagen: IMAGENES.adminVotaciones,
    titulo: "Votaciones",
    texto: "Votación activa y resultado",
  },
  {
    ruta: "/admin/discucharlas",
    imagen: IMAGENES.adminCrear,
    titulo: "Crear",
    texto: "Nueva ficha de Discucharla",
  },
];

export function PantallaAdmin({ resumen }: { resumen: React.ReactNode }) {
  const router = useRouter();

  return (
    <section className="page active" id="administracion" data-admin-page="true">
      <Backline a="/inicio" texto="Volver a Inicio" />

      <header className="admin-landing-hero">
        <div className="admin-landing-copy">
          <div className="eyebrow">ADMINISTRACIÓN</div>
          <h1 className="page-title">Administración</h1>
          <p>Organiza accesos, integrantes, votaciones y nuevas Discucharlas.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="admin-landing-art"
          alt="Collage editorial de Administración"
          src={IMAGENES.admin}
        />
      </header>

      {resumen}

      <div className="admin-grid admin-grid-refined">
        {MOSAICOS.map((m) => (
          <button
            key={m.ruta}
            className="admin-tile admin-tile-refined"
            onClick={() => router.push(m.ruta)}
          >
            <span className="admin-cutout" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.imagen} alt="" />
            </span>
            <span className="admin-tile-copy">
              <b>{m.titulo}</b>
              <small>{m.texto}</small>
            </span>
            <span className="admin-tile-arrow">›</span>
          </button>
        ))}
        <button
          className="admin-tile admin-tile-refined admin-export-tile"
          onClick={() => router.push("/admin/historial")}
        >
          <span className="admin-export-icon" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGENES.adminHistorial} alt="" />
          </span>
          <span className="admin-tile-copy">
            <b>Historial / Excel</b>
            <small>Consulta y descarga el registro filtrado</small>
          </span>
          <span className="admin-tile-arrow">›</span>
        </button>
      </div>
    </section>
  );
}
