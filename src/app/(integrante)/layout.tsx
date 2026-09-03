import Link from "next/link";
import { NavegacionInferior } from "@/components/NavegacionInferior";
import { exigirIntegrante, esAdministradora } from "@/lib/sesion";

export default async function CascaronIntegrante({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await exigirIntegrante();

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <Link href="/inicio" className="editorial text-[1.35rem] leading-none">
          Discucharlas
        </Link>
        <div className="flex items-center gap-4">
          {esAdministradora(perfil) && (
            <Link
              href="/admin"
              className="text-[14px] text-[var(--color-tinta-suave)] underline underline-offset-4"
            >
              Administración
            </Link>
          )}
          <Link
            href="/perfil"
            aria-label="Mi perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-club)] text-[15px] font-medium text-white"
          >
            {perfil.first_name.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      {children}

      <NavegacionInferior />
    </div>
  );
}
