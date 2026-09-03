import Link from "next/link";
import InstalarApp from "@/components/InstalarApp";
import RegistrarServiceWorker from "@/components/RegistrarServiceWorker";

const RITUAL = [
  {
    paso: "01",
    titulo: "Proponemos",
    texto: "Cada quien deja en el banco los episodios que le movieron algo.",
    color: "var(--color-propuestas)",
  },
  {
    paso: "02",
    titulo: "Votamos",
    texto: "Una sola votación abierta. Reglas visibles, resultado a la vista.",
    color: "var(--color-inicio)",
  },
  {
    paso: "03",
    titulo: "Nos encontramos",
    texto: "Fecha, casa y qué lleva cada quien, resuelto sin veinte mensajes.",
    color: "var(--color-calendario)",
  },
  {
    paso: "04",
    titulo: "Recordamos",
    texto: "Cada discucharla queda guardada como memoria del club.",
    color: "var(--color-club)",
  },
];

const SECCIONES = [
  {
    nombre: "Inicio",
    color: "var(--color-inicio)",
    texto: "Qué sigue, dónde y a qué hora. Con el episodio a un toque de distancia.",
  },
  {
    nombre: "Calendario",
    color: "var(--color-calendario)",
    texto: "Las discucharlas próximas, las vividas y las que no pudieron ser.",
  },
  {
    nombre: "Propuestas",
    color: "var(--color-propuestas)",
    texto: "La votación activa y el banco de podcasts que esperan su turno.",
  },
  {
    nombre: "Comunidad",
    color: "var(--color-comunidad-fuerte)",
    texto: "La conversación que sigue después de colgar los audífonos.",
  },
  {
    nombre: "Club",
    color: "var(--color-club)",
    texto: "Nuestro círculo, sus perfiles y la memoria compartida.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-dvh bg-[var(--color-papel)]">
      <RegistrarServiceWorker />

      {/* ------------------------------------------------------------------ */}
      {/* Portada                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="grano relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-28 h-72 w-72 rounded-full opacity-80 sm:-top-32 sm:-right-24 sm:h-[26rem] sm:w-[26rem]"
          style={{ background: "var(--color-inicio-suave)" }}
        />
        <div
          aria-hidden
          className="absolute -left-24 top-64 h-56 w-56 rounded-full opacity-70 sm:top-40 sm:-left-28 sm:h-72 sm:w-72"
          style={{ background: "var(--color-club-medio)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-24 right-1/4 h-52 w-52 rotate-12 opacity-60 sm:right-1/3 sm:h-64 sm:w-64"
          style={{ background: "var(--color-calendario-medio)", borderRadius: "44% 56% 61% 39%" }}
        />
        {/* Veladura de papel: deja ver el collage pero garantiza que la
            tipografía siempre caiga sobre fondo legible. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, var(--color-papel) 18%, rgba(251,246,238,0.88) 52%, rgba(251,246,238,0.30) 100%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <p className="text-[12px] font-semibold tracking-[0.28em] text-[var(--color-tinta-suave)] uppercase">
            Club privado de escucha
          </p>

          <h1 className="editorial mt-6 text-[clamp(2.9rem,11vw,6.5rem)] leading-[0.92] text-[var(--color-tinta)]">
            Discu
            <span style={{ color: "var(--color-inicio)" }}>charlas</span>
          </h1>

          <p className="mt-7 max-w-xl text-[19px] leading-relaxed text-[var(--color-tinta-suave)] sm:text-[21px]">
            Escuchamos un podcast por nuestra cuenta y nos juntamos a conversarlo
            en casa de alguna. Esta app es donde eso se organiza, se decide y se
            queda guardado.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/entrar"
              className="rounded-full bg-[var(--color-tinta)] px-8 py-4 text-center text-[17px] font-medium text-[var(--color-papel)] transition hover:brightness-125"
            >
              Entrar al club
            </Link>
            <Link
              href="#instalar"
              className="rounded-full border border-[var(--color-tinta)] px-8 py-4 text-center text-[17px] font-medium text-[var(--color-tinta)] transition hover:bg-[var(--color-tinta)] hover:text-[var(--color-papel)]"
            >
              Llevarla en el teléfono
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* El ritual                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-[var(--color-linea)] bg-[var(--color-papel-hondo)]">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="editorial text-[clamp(1.9rem,5vw,2.8rem)] leading-tight">
            Un ritual, cada dos semanas
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-tarjeta)] bg-[var(--color-linea)] sm:grid-cols-2">
            {RITUAL.map((r) => (
              <article key={r.paso} className="bg-[var(--color-papel)] p-7">
                <span
                  className="editorial text-[2.6rem] leading-none"
                  style={{ color: r.color }}
                >
                  {r.paso}
                </span>
                <h3 className="mt-4 text-[1.35rem]">{r.titulo}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
                  {r.texto}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Secciones                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="editorial text-[clamp(1.9rem,5vw,2.8rem)] leading-tight">
          Cinco lugares, una misma casa
        </h2>
        <ul className="mt-10 space-y-px overflow-hidden rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)]">
          {SECCIONES.map((s) => (
            <li
              key={s.nombre}
              className="flex flex-col gap-1 border-b border-[var(--color-linea)] bg-white/60 px-6 py-6 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span
                className="editorial min-w-[9rem] text-[1.5rem]"
                style={{ color: s.color }}
              >
                {s.nombre}
              </span>
              <span className="text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
                {s.texto}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Instalación                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="instalar"
        className="grano relative overflow-hidden scroll-mt-8"
        style={{ background: "var(--color-subpagina)" }}
      >
        <div className="relative mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:py-24 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.28em] text-white/60 uppercase">
              Sin tiendas de aplicaciones
            </p>
            <h2 className="editorial mt-5 text-[clamp(2rem,6vw,3.2rem)] leading-[1.05] text-white">
              Instálala directo desde aquí
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/75">
              Discucharlas se instala desde el navegador y queda en tu pantalla
              de inicio como cualquier otra app. No pasa por App Store ni por
              Google Play.
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
              El acceso es solo para integrantes del club. Si todavía no tienes
              cuenta, necesitas una invitación de alguna de nosotras.
            </p>
          </div>

          <div className="space-y-4 rounded-[var(--radius-tarjeta)] bg-[var(--color-papel)] p-6 sm:p-8">
            <InstalarApp />
            <div className="border-t border-[var(--color-linea)] pt-4">
              <Link
                href="/entrar"
                className="block text-[16px] font-medium text-[var(--color-tinta)] underline underline-offset-4"
              >
                Ya soy integrante — entrar
              </Link>
              <Link
                href="/invitada"
                className="mt-3 block text-[16px] text-[var(--color-tinta-suave)] underline underline-offset-4"
              >
                Tengo una clave de invitada
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-[14px] text-[var(--color-tinta-suave)]">
          Discucharlas · un club privado. Contenido y perfiles visibles solo para
          integrantes.
        </p>
      </footer>
    </main>
  );
}
