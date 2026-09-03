export function Aviso({
  tono = "error",
  children,
}: {
  tono?: "error" | "exito" | "neutro";
  children: React.ReactNode;
}) {
  const estilos = {
    error: "border-[var(--color-error)]/30 bg-[var(--color-error)]/8 text-[var(--color-error)]",
    exito: "border-[var(--color-exito)]/30 bg-[var(--color-exito)]/8 text-[var(--color-exito)]",
    neutro: "border-[var(--color-linea)] bg-white/70 text-[var(--color-tinta-suave)]",
  }[tono];

  return (
    <p
      role={tono === "error" ? "alert" : "status"}
      className={`rounded-[var(--radius-suave)] border px-4 py-3 text-[15px] leading-relaxed ${estilos}`}
    >
      {children}
    </p>
  );
}
