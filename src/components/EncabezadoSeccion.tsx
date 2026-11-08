import Image from "next/image";
import { SECCIONES, type ClaveSeccion } from "@/lib/secciones";
import { colajeDe } from "@/lib/colaje";

/**
 * Encabezado editorial por sección. El encuadre del collage sigue V135: no todo
 * es un recorte lateral al 46 % (eso rompe panoramas y retratos).
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
  const modo = seccion.modoEncabezado;

  if (modo === "texto") {
    return (
      <section className="relative mt-4 overflow-hidden rounded-[var(--radius-tarjeta)] border border-[#eaded1] bg-[#fbf4ea] px-6 py-5">
        <Copia seccion={seccion} dato={dato} />
      </section>
    );
  }

  if (modo === "fondo") {
    return (
      <section
        className="relative mt-4 min-h-[8.25rem] overflow-hidden rounded-[var(--radius-tarjeta)] border border-[#e4cfad]"
        style={{ background: seccion.fondo }}
      >
        {imagen ? (
          <Image
            src={imagen}
            alt=""
            fill
            priority
            sizes="430px"
            className="object-cover object-center"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(150deg, ${seccion.color} 0%, transparent 85%)`,
              opacity: 0.35,
            }}
          />
        )}
        <div className="relative z-10 max-w-[52%] px-5 py-5">
          <Copia seccion={seccion} dato={dato} />
        </div>
      </section>
    );
  }

  if (modo === "rejilla") {
    return (
      <section
        className="relative mt-4 grid min-h-[8.25rem] overflow-hidden rounded-[var(--radius-tarjeta)] border border-[#e4cfad]"
        style={{ gridTemplateColumns: "minmax(0, 1fr) 49%", background: seccion.fondo }}
      >
        <div className="relative z-10 flex flex-col justify-center px-5 py-5">
          <Copia seccion={seccion} dato={dato} />
        </div>
        <div className="relative min-h-[8.25rem] overflow-hidden" style={{ background: seccion.fondo }}>
          {imagen ? (
            <>
              <Image
                src={imagen}
                alt=""
                fill
                sizes="210px"
                className="object-cover object-center saturate-[0.92]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-7"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-comunidad-crema) 0%, color-mix(in oklab, var(--color-comunidad-crema) 70%, transparent) 32%, transparent 100%)",
                }}
              />
            </>
          ) : (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `linear-gradient(150deg, ${seccion.color} 0%, transparent 85%)`,
                opacity: 0.35,
              }}
            />
          )}
        </div>
      </section>
    );
  }

  // banda — Club: foto a ancho completo con título encima (V135 club-photo-head).
  return (
    <section className="relative -mx-5 mt-4 h-[10.625rem] overflow-hidden">
      {imagen ? (
        <Image
          src={imagen}
          alt=""
          fill
          priority
          sizes="430px"
          className="object-cover object-[center_40%] saturate-90 contrast-[1.03]"
        />
      ) : (
        <div aria-hidden className="absolute inset-0" style={{ background: seccion.fondo }} />
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,18,32,.02) 25%, rgba(62,37,21,.32) 100%)",
        }}
      />
      <div className="relative z-10 px-5 pt-4 text-white drop-shadow-[0_1px_12px_rgba(0,0,0,.35)]">
        <Copia
          seccion={seccion}
          dato={dato}
          claro
          eyebrowClassName="!text-[#fff4d8]"
        />
      </div>
    </section>
  );
}

function Copia({
  seccion,
  dato,
  claro = false,
  eyebrowClassName,
}: {
  seccion: (typeof SECCIONES)[Exclude<ClaveSeccion, "inicio">];
  dato?: string;
  claro?: boolean;
  eyebrowClassName?: string;
}) {
  const textoSuave = claro ? "text-white/85" : "text-[var(--color-tinta-suave)]";
  const titulo = claro ? "text-white" : "text-[var(--color-tinta)]";

  return (
    <>
      <p
        className={`text-[11px] font-semibold tracking-[0.2em] uppercase ${eyebrowClassName ?? ""}`}
        style={eyebrowClassName ? undefined : { color: seccion.tinte }}
      >
        {seccion.eyebrow}
      </p>
      <h2 className={`editorial mt-2.5 text-[1.9rem] leading-[1.08] ${titulo}`}>
        {seccion.encabezado}
      </h2>
      {seccion.entrada && (
        <p className={`mt-2 text-[14px] leading-relaxed ${textoSuave}`}>{seccion.entrada}</p>
      )}
      {dato && <p className={`mt-2 text-[14px] leading-snug ${textoSuave}`}>{dato}</p>}
    </>
  );
}
