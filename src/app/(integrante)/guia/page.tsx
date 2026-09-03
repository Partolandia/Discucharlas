import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";

export const metadata = { title: "Guía del club" };

export default async function Guia() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data: secciones } = await supabase
    .from("guide_sections")
    .select("*")
    .order("sort_order");

  return (
    <main className="px-5 pb-8">
      <Link
        href="/inicio"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <header
        className="grano relative mt-5 overflow-hidden rounded-[var(--radius-tarjeta)] px-6 py-7 text-white"
        style={{ background: "var(--color-subpagina)" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">
          Cómo funciona esto
        </p>
        <h1 className="editorial mt-2.5 text-[1.9rem] leading-[1.08]">Guía del club</h1>
      </header>

      {secciones && secciones.length > 0 ? (
        <div className="mt-7 space-y-8">
          {secciones.map((s) => (
            <section key={s.id}>
              <h2 className="editorial text-[1.4rem] leading-tight">{s.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-tinta-suave)] whitespace-pre-line">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          La guía todavía está por escribirse.
        </p>
      )}
    </main>
  );
}
