import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { exigirIntegrante } from "@/lib/sesion";
import { ListaHistorialEditorial } from "@/components/historial/ListaHistorialEditorial";

export const metadata = { title: "Historial de discucharlas" };

export default async function HistorialDiscucharlas() {
  await exigirIntegrante();
  const supabase = await crearClienteServidor();

  const [sesiones, stats] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .in("status", ["upcoming", "past", "cancelled"])
      .order("date", { ascending: false, nullsFirst: false }),
    supabase.from("session_stats").select("session_id, attendee_count, average_rating"),
  ]);

  const statsPorId = new Map<string, { attendee_count: number | null; average_rating: number | null }>();
  for (const s of stats.data ?? []) {
    if (s.session_id) {
      statsPorId.set(s.session_id, {
        attendee_count: s.attendee_count,
        average_rating: s.average_rating,
      });
    }
  }

  return (
    <main className="-mt-1 bg-[#f6f0e8] px-5 pb-24">
      <Link
        href="/inicio"
        className="inline-block pt-3 text-[15px] text-[#6d5b77] underline underline-offset-4"
      >
        Volver a inicio
      </Link>

      <header
        className="relative -mx-5 mt-2 flex min-h-[126px] items-end border-b border-[#d8c0c6] bg-[var(--color-archivo-suave)] px-[18px] pt-4 pb-[18px] text-[#24152e]"
      >
        <div>
          <p className="text-[8px] font-extrabold tracking-[0.16em] text-[var(--color-archivo)] uppercase">
            La memoria del club
          </p>
          <h1 className="editorial mt-1.5 text-[28px] leading-[1.02] tracking-tight">
            Historial de Discucharlas
          </h1>
          <p className="mt-1.5 max-w-[240px] text-[9.5px] leading-snug text-[#5f5860]">
            Todo lo que hemos escuchado y conversado juntas.
          </p>
        </div>
      </header>

      <div className="mt-3">
        <ListaHistorialEditorial sesiones={sesiones.data ?? []} statsPorId={statsPorId} />
      </div>
    </main>
  );
}
