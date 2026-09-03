import Link from "next/link";

export const metadata = { title: "Entrar" };

// Pendiente: conectar con Supabase Auth (email + contraseña) en cuanto exista
// el proyecto. La estructura y el tono de la pantalla ya son los definitivos.
export default function Entrar() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <h1 className="editorial mt-8 text-[clamp(2.2rem,9vw,3rem)] leading-[1.05]">
        Entrar al club
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-tinta-suave)]">
        Con el correo y la contraseña que creaste al aceptar tu invitación.
      </p>

      <div className="mt-10 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 p-6">
        <p className="text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          El acceso se activa en cuanto conectemos el proyecto de Supabase del
          club.
        </p>
      </div>

      <p className="mt-8 text-[15px] text-[var(--color-tinta-suave)]">
        ¿Te invitaron? Abre el enlace que te llegó por correo.
      </p>
    </main>
  );
}
