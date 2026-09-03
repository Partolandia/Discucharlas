import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { directorioDelClub } from "@/lib/club";
import { Avatar } from "@/components/club/Avatar";

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

export default async function PerfilDeIntegrante({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirIntegrante();

  const supabase = await crearClienteServidor();
  const [directorio, asistencias] = await Promise.all([
    directorioDelClub(),
    supabase.from("session_attendance").select("user_id").eq("present", true).eq("user_id", id),
  ]);

  const integrante = directorio.get(id);
  if (!integrante) notFound();

  const nombre = [integrante.first_name, integrante.last_name].filter(Boolean).join(" ").trim();
  const sesiones = asistencias.data?.length ?? 0;

  return (
    <main className="px-5 pb-8">
      <Link
        href="/club"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver al club
      </Link>

      <header
        className="mt-5 rounded-[var(--radius-tarjeta)] px-6 py-7"
        style={{ background: "var(--color-club-suave)" }}
      >
        <Avatar id={integrante.id} nombre={nombre} tamano={72} />
        <p
          className="mt-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: "var(--color-club-fuerte)" }}
        >
          Integrante{integrante.role === "admin" && " · Administradora"}
        </p>
        <h1 className="editorial mt-1.5 text-[2rem] leading-tight">{nombre}</h1>
        <p className="mt-2 text-[15px] text-[var(--color-tinta-suave)]">
          {sesiones} {sesiones === 1 ? "discucharla" : "discucharlas"}
        </p>
      </header>

      {integrante.bio && (
        <section className="mt-7">
          <h2 className="editorial text-[1.4rem]">Sobre ella</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            {integrante.bio}
          </p>
        </section>
      )}

      {integrante.interests && (
        <section className="mt-7">
          <h2 className="editorial text-[1.4rem]">Le interesa</h2>
          {/* Texto seguido, no una acumulación de etiquetas. */}
          <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-tinta-suave)]">
            {integrante.interests}
          </p>
        </section>
      )}

      {integrante.birthday_day && integrante.birthday_month && (
        <section className="mt-7">
          <h2 className="editorial text-[1.4rem]">Cumple</h2>
          <p className="mt-2 text-[16px] text-[var(--color-tinta-suave)]">
            {integrante.birthday_day} de {MESES[integrante.birthday_month - 1]}
          </p>
        </section>
      )}
    </main>
  );
}
