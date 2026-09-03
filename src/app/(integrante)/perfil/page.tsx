import Link from "next/link";
import { exigirIntegrante } from "@/lib/sesion";
import { salir } from "@/app/entrar/acciones";
import { Avatar } from "@/components/club/Avatar";
import { FormularioPerfil } from "@/components/club/FormularioPerfil";

export const metadata = { title: "Mi perfil" };

export default async function MiPerfil() {
  const perfil = await exigirIntegrante();
  const nombre = [perfil.first_name, perfil.last_name].filter(Boolean).join(" ").trim();

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
        <Avatar id={perfil.id} nombre={nombre} tamano={72} />
        <p
          className="mt-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: "var(--color-club-fuerte)" }}
        >
          Tu perfil
          {perfil.is_owner
            ? " · Propietaria"
            : perfil.role === "admin" && " · Administradora"}
        </p>
        <h1 className="editorial mt-1.5 text-[2rem] leading-tight">{nombre}</h1>
        <p className="mt-1.5 text-[15px] text-[var(--color-tinta-suave)]">{perfil.email}</p>
      </header>

      <section className="mt-8">
        <FormularioPerfil perfil={perfil} />
      </section>

      <form action={salir} className="mt-10 border-t border-[var(--color-linea)] pt-6">
        <button
          type="submit"
          className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
