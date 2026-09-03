import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  ayuda?: string;
};

export function Campo({ etiqueta, ayuda, id, ...props }: Props) {
  const idCampo = id ?? props.name;
  const idAyuda = ayuda ? `${idCampo}-ayuda` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={idCampo} className="block text-[15px] font-medium text-[var(--color-tinta)]">
        {etiqueta}
      </label>
      <input
        id={idCampo}
        aria-describedby={idAyuda}
        {...props}
        className="w-full rounded-[var(--radius-suave)] border border-[var(--color-linea)] bg-white px-4 py-3 text-[16px] text-[var(--color-tinta)] placeholder:text-[var(--color-tinta-suave)]/60 focus:border-[var(--color-tinta)] focus:outline-none"
      />
      {ayuda && (
        <p id={idAyuda} className="text-[14px] text-[var(--color-tinta-suave)]">
          {ayuda}
        </p>
      )}
    </div>
  );
}
