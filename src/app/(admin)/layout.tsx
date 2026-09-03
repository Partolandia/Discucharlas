import Link from "next/link";
import { exigirAdministradora } from "@/lib/sesion";

/**
 * Administración usa la familia visual del producto con acentos propios: no es
 * un sistema aparte, pero sí se nota que estás operando el club.
 */
export default async function CascaronAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await exigirAdministradora();

  return (
    <div className="mx-auto min-h-dvh max-w-md" style={{ background: "var(--color-papel)" }}>
      <header className="sticky top-0 z-20" style={{ background: "var(--color-tinta)" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <Link href="/admin" className="editorial text-[1.2rem] leading-none text-white">
            Administración
          </Link>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
            style={{ background: "var(--color-admin-oro)", color: "var(--color-tinta)" }}
          >
            {perfil.is_owner ? "Propietaria" : "Admin"}
          </span>
        </div>
      </header>

      {children}

      <footer className="px-5 py-8">
        <Link
          href="/inicio"
          className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
        >
          Volver a inicio
        </Link>
      </footer>
    </div>
  );
}
