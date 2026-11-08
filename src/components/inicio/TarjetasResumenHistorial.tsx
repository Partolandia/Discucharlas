import Link from "next/link";

/**
 * Resumen en Inicio: aparece en prototipo-sesiones-v2 bajo el hero (#archiveMemoryStrip).
 */
export function TarjetasResumenHistorial({
  realizadas,
  proximaTitulo,
}: {
  realizadas: number;
  proximaTitulo: string | null;
}) {
  return (
    <div
      aria-label="Resumen del club"
      className="mt-4 grid grid-cols-2 gap-2.5"
    >
      <Link
        href="/nuestras-discucharlas"
        className="relative flex min-h-0 flex-col overflow-hidden rounded-[15px] border border-[#e0d6ca] bg-[#fffdf9] px-3 pt-3.5 pb-2.5 shadow-[0_3px_10px_#39234104]"
      >
        <span
          aria-hidden
          className="absolute top-0 left-3 h-[3px] w-[26px] rounded-b-[4px]"
          style={{ background: "#a87487" }}
        />
        <small className="text-[9px] font-extrabold tracking-[0.16em] text-[#84656f] uppercase">
          Realizadas
        </small>
        <h4 className="mt-2 flex min-h-[44px] items-center gap-2">
          <span className="editorial text-[2.5rem] leading-none font-semibold tracking-tight text-[#95677f]">
            {realizadas}
          </span>
          <span className="text-[12px] leading-snug font-medium text-[#443549]">
            {realizadas === 1 ? "discucharla en memoria" : "discucharlas en memoria"}
          </span>
        </h4>
      </Link>

      <Link
        href={proximaTitulo ? "/calendario" : "/propuestas"}
        className="relative flex min-h-0 flex-col overflow-hidden rounded-[15px] border border-[#e0d6ca] bg-[#fffdf9] px-3 pt-3.5 pb-2.5 shadow-[0_3px_10px_#39234104]"
      >
        <span
          aria-hidden
          className="absolute top-0 left-3 h-[3px] w-[26px] rounded-b-[4px]"
          style={{ background: "#7f8750" }}
        />
        <small className="text-[9px] font-extrabold tracking-[0.16em] text-[#84656f] uppercase">
          Próxima
        </small>
        {proximaTitulo ? (
          <p className="mt-2 min-h-[44px] text-[12px] leading-snug font-medium text-[#443549] line-clamp-3">
            {proximaTitulo}
          </p>
        ) : (
          <p className="mt-2 min-h-[44px] text-[12px] leading-snug text-[#786d76]">
            Sin fecha aún — revisa propuestas
          </p>
        )}
      </Link>
    </div>
  );
}
