"use client";

import { useRouter, usePathname } from "next/navigation";
import { pantallaDe, PESTANAS, IMAGENES, type Pantalla } from "@/lib/prototipo";

/**
 * El marco del prototipo v2: .stage > .phone > .top + pantalla + .nav
 *
 * Se conservan las etiquetas y clases originales (incluidos los <button> de
 * navegación) para que src/estilos/prototipo-v2.css funcione sin tocarlo. Por
 * eso navegamos con el router y no con <Link>: el CSS selecciona
 * `.nav button[data-page]` en más de cien reglas.
 */
export function Cascaron({
  nombre,
  inicial,
  esAdmin,
  pantallaForzada,
  children,
}: {
  nombre: string;
  inicial: string;
  esAdmin: boolean;
  /** Solo para /vista-previa, que no vive en las rutas reales. */
  pantallaForzada?: Pantalla;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const ruta = usePathname();
  const pantalla = pantallaForzada ?? pantallaDe(ruta);

  return (
    <main className="stage">
      <section className="phone" data-section={pantalla.seccion}>
        <header className="top">
          <div className="identity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Discucharlas" className="logo" src={IMAGENES.logo} />
            <span className="greeting" id="title">
              {pantalla.titulo ?? `Hola, ${nombre}`}
            </span>
          </div>
          <div className="tools">
            <button
              aria-label="Notificaciones"
              className="icon"
              onClick={() => router.push("/avisos")}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </button>
            <button aria-label="Ajustes" className="icon" onClick={() => router.push("/perfil")}>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.38.34.72.6 1 .3.3.68.47 1.1.5h.09v4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
              </svg>
            </button>
            {esAdmin && (
              <button className="admin" onClick={() => router.push("/admin")}>
                {inicial}
              </button>
            )}
          </div>
        </header>

        {children}

        <nav className="nav">
          {PESTANAS.map((p) => (
            <button
              key={p.pagina}
              className={pantalla.seccion === p.seccion ? "active" : undefined}
              data-page={p.pagina}
              onClick={() => router.push(p.ruta)}
            >
              <IconoPestana pagina={p.pagina} />
              {p.texto}
            </button>
          ))}
        </nav>

        <div className="toast" id="toast" />
      </section>
    </main>
  );
}

function IconoPestana({ pagina }: { pagina: string }) {
  if (pagina === "inicio") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path className="home-fill" d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </svg>
    );
  }
  if (pagina === "calendario") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="16" rx="2" width="18" x="3" y="5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    );
  }
  if (pagina === "votacion") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 10v4h4l5 4V6L8 10H4Z" />
        <path d="M16 9.5a4 4 0 0 1 0 5" />
        <path d="M18.5 7a7.5 7.5 0 0 1 0 10" />
      </svg>
    );
  }
  if (pagina === "comunidad") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-4.2A7 7 0 0 1 3 13c0-4.4 4-8 9-8s9 3.6 9 8Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 1-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
