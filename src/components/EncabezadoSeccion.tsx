import Image from "next/image";
import { SECCIONES, type ClaveSeccion } from "@/lib/secciones";
import { colajeDe } from "@/lib/colaje";

/**
 * Encabezado editorial: cintillo, título serif, entrada y collage sangrado a la
 * derecha. Misma familia en Calendario, Propuestas, Comunidad y Club.
 */
export function EncabezadoSeccion({
  clave,
  dato,
}: {
  clave: Exclude<ClaveSeccion, "inicio">;
  dato?: string;
}) {
  const seccion = SECCIONES[clave];
  const imagen = colajeDe(clave);
  const conFondo = seccion.fondo !== "transparent";

  return (
    <section
      className={`relative mt-4 overflow-hidden ${conFondo ? "rounded-[var(--radius-tarjeta)]" : ""}`}
      style={{ background: seccion.fondo }}
    >
      <div className="relative z-10 max-w-[62%] px-6 py-7">
        <p
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: seccion.tinte }}
        >
          {seccion.eyebrow}
        </p>
        <h2 className="editorial mt-2.5 text-[1.9rem] leading-[1.08]">{seccion.encabezado}</h2>
        {seccion.entrada && (
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-tinta-suave)]">
            {seccion.entrada}
          </p>
        )}
        {dato && (
          <p className="mt-2 text-[14px] leading-snug text-[var(--color-tinta-suave)]">{dato}</p>
        )}
      </div>

      {imagen ? (
        <Image
          src={imagen}
          alt=""
          fill
          priority
          sizes="430px"
          className="!left-auto !w-[46%] object-cover object-left"
        />
      ) : (
        conFondo && (
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-[42%]"
            style={{
              background: `linear-gradient(150deg, ${seccion.color} 0%, transparent 85%)`,
              opacity: 0.35,
            }}
          />
        )
      )}
    </section>
  );
}
