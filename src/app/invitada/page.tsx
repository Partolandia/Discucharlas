import Link from "next/link";

export const metadata = { title: "Invitada" };

// Pendiente: validar la clave compartida contra guest_access y abrir la vista
// restringida de Inicio.
export default function Invitada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <h1 className="editorial mt-8 text-[clamp(2.2rem,9vw,3rem)] leading-[1.05]">
        Vienes de visita
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-tinta-suave)]">
        Con la clave que te compartieron puedes ver la próxima discucharla y la
        guía del club.
      </p>

      <div className="mt-10 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 p-6">
        <p className="text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          El acceso de invitadas se activa junto con el proyecto de Supabase del
          club.
        </p>
      </div>
    </main>
  );
}
