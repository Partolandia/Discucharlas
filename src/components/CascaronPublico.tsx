import Link from "next/link";

/** Marco compartido de las pantallas públicas: acceso, recuperación, invitada. */
export function CascaronPublico({
  titulo,
  entrada,
  children,
}: {
  titulo: string;
  entrada?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-14">
      <Link
        href="/"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <h1 className="editorial mt-8 text-[clamp(2.2rem,9vw,3rem)] leading-[1.05]">{titulo}</h1>
      {entrada && (
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-tinta-suave)]">
          {entrada}
        </p>
      )}

      <div className="mt-9">{children}</div>
    </main>
  );
}
