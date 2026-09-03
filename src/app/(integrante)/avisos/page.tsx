import Link from "next/link";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { fechaLarga } from "@/lib/fechas";

export const metadata = { title: "Avisos" };

/** Marcar todo como leído al entrar sería mentira; se hace a propósito. */
async function marcarLeidos() {
  "use server";
  const perfil = await exigirIntegrante();
  const supabase = await crearClienteServidor();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", perfil.id)
    .is("read_at", null);
  revalidatePath("/avisos");
  revalidatePath("/inicio");
}

export default async function Avisos() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const { data: avisos } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const sinLeer = (avisos ?? []).filter((a) => !a.read_at).length;

  return (
    <main className="px-5 pb-8">
      <Link
        href="/inicio"
        className="text-[15px] text-[var(--color-tinta-suave)] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h1 className="editorial text-[1.9rem] leading-tight">Avisos</h1>
        {sinLeer > 0 && (
          <form action={marcarLeidos}>
            <button type="submit" className="text-[14px] underline underline-offset-4">
              Marcar como leídos
            </button>
          </form>
        )}
      </div>

      {avisos && avisos.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {avisos.map((a) => (
            <li
              key={a.id}
              className="rounded-[var(--radius-tarjeta)] bg-[var(--color-blanco)] px-5 py-4"
              style={
                a.read_at
                  ? { opacity: 0.7 }
                  : { borderLeft: "3px solid var(--color-inicio)" }
              }
            >
              <p className="text-[16px] leading-snug font-medium">{a.title}</p>
              {a.body && (
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
                  {a.body}
                </p>
              )}
              <p className="mt-2 text-[13px] text-[var(--color-tinta-suave)]">
                {fechaLarga(a.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-[var(--radius-tarjeta)] border border-[var(--color-linea)] bg-white/60 px-6 py-8 text-center text-[15px] leading-relaxed text-[var(--color-tinta-suave)]">
          No hay avisos todavía. Aquí te llegan cuando se agende una discucharla o se abra
          una votación.
        </p>
      )}
    </main>
  );
}
