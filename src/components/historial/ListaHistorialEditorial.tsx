"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { fechaLarga } from "@/lib/fechas";
import type { EstadoSesion } from "@/lib/dominio";
import type { Database } from "@/lib/supabase/tipos";

type Sesion = Database["public"]["Tables"]["sessions"]["Row"];

type Filtro = "all" | EstadoSesion;

const PESTANAS: { id: Filtro; etiqueta: string }[] = [
  { id: "all", etiqueta: "Todas" },
  { id: "upcoming", etiqueta: "Próximas" },
  { id: "past", etiqueta: "Realizadas" },
  { id: "cancelled", etiqueta: "Canceladas" },
];

const ETIQUETA_ESTADO: Record<EstadoSesion, string> = {
  draft: "BORRADOR",
  upcoming: "PRÓXIMA",
  past: "REALIZADA",
  cancelled: "CANCELADA",
};

const COLOR_ESTATUS: Record<EstadoSesion, string> = {
  upcoming: "#b37a86",
  past: "#6d5b77",
  cancelled: "#999096",
  draft: "#5a6f8f",
};

function portadaDeSesion(sesion: Sesion, indice: number) {
  if (sesion.image_path) {
    return (
      <Image
        src={sesion.image_path}
        alt=""
        width={72}
        height={82}
        className="h-[82px] w-[72px] rounded-[10px] object-cover shadow-[0_1px_0_#32213d0f]"
      />
    );
  }

  const fondos: Record<EstadoSesion, string> = {
    upcoming: "linear-gradient(140deg,#b37a86,#d49586)",
    past:
      indice % 2 === 0
        ? "linear-gradient(140deg,#6c7f93,#a28bbf)"
        : "linear-gradient(140deg,#bb7e86,#ef8c6c)",
    cancelled: "#b3a8ad",
    draft: "linear-gradient(140deg,#61758D,#8a9bb0)",
  };

  const inicial = sesion.episode_title.trim().charAt(0).toUpperCase() || "·";

  return (
    <span
      aria-hidden
      className="grid h-[82px] w-[72px] shrink-0 place-items-center rounded-[10px] text-[1.35rem] font-medium text-[#fffdfa]"
      style={{ background: fondos[sesion.status as EstadoSesion] }}
    >
      {sesion.status === "upcoming" ? "＋" : inicial}
    </span>
  );
}

export function ListaHistorialEditorial({
  sesiones,
  statsPorId,
}: {
  sesiones: Sesion[];
  statsPorId: Map<string, { attendee_count: number | null; average_rating: number | null }>;
}) {
  const [filtro, setFiltro] = useState<Filtro>("all");

  const visibles = useMemo(() => {
    const base =
      filtro === "all" ? sesiones : sesiones.filter((s) => s.status === filtro);
    return [...base].sort((a, b) => {
      const da = a.date ?? "";
      const db = b.date ?? "";
      return db.localeCompare(da);
    });
  }, [filtro, sesiones]);

  return (
    <>
      <div
        role="tablist"
        aria-label="Filtrar historial"
        className="scrollbar-none -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pt-0.5 pb-2.5"
      >
        {PESTANAS.map((p) => {
          const activa = filtro === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setFiltro(p.id)}
              className={
                activa
                  ? "shrink-0 rounded-full border border-[#24152e] bg-[#24152e] px-2.5 py-1.5 text-[8.5px] font-[750] text-white"
                  : "shrink-0 rounded-full border border-[#d8cdbd] bg-[#fffdfa] px-2.5 py-1.5 text-[8.5px] font-[750] text-[#6c6170]"
              }
            >
              {p.etiqueta}
            </button>
          );
        })}
      </div>

      {visibles.length > 0 ? (
        <ul className="space-y-2">
          {visibles.map((s, i) => {
            const estado = s.status as EstadoSesion;
            const dato = statsPorId.get(s.id);
            const meta = [
              s.date && fechaLarga(s.date),
              s.place,
              dato?.attendee_count ? `${dato.attendee_count} vinieron` : null,
              dato?.average_rating ? `${dato.average_rating} de 5` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            const destacada = estado === "upcoming";
            const cancelada = estado === "cancelled";

            return (
              <li key={s.id}>
                <Link
                  href={`/discucharla/${s.id}`}
                  className={
                    "relative grid grid-cols-[72px_1fr_18px] items-center gap-[11px] rounded-[15px] border border-[#e1d7c9] bg-[#fffdfa] p-2 shadow-[0_5px_14px_#24152e0b] " +
                    (destacada ? "border-[#e0c7cd] bg-[#fdf9fa] " : "") +
                    (cancelada ? "opacity-[0.72] " : "")
                  }
                >
                  {portadaDeSesion(s, i)}
                  <div className="min-w-0">
                    <span
                      className="mb-1 block text-[7.5px] font-extrabold tracking-[0.13em]"
                      style={{ color: COLOR_ESTATUS[estado] }}
                    >
                      {ETIQUETA_ESTADO[estado]}
                    </span>
                    <h2 className="editorial text-[16px] leading-[1.08] tracking-tight text-[#24152e]">
                      {s.episode_title}
                    </h2>
                    <p className="mt-1 text-[8.5px] leading-snug text-[#837985]">
                      {s.podcast_name}
                      {meta ? ` · ${meta}` : ""}
                    </p>
                  </div>
                  <span aria-hidden className="text-center text-[14px] text-[#b8a99f]">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-[15px] border border-[#e1d7c9] bg-[#fffdfa] px-5 py-8 text-center text-[14px] leading-relaxed text-[#6c6170]">
          No hay discucharlas en esta vista.
        </p>
      )}
    </>
  );
}
