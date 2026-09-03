"use client";

import { useFormStatus } from "react-dom";

export function BotonEnviar({
  children,
  ocupado,
}: {
  children: React.ReactNode;
  ocupado?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[var(--color-tinta)] px-8 py-4 text-[17px] font-medium text-[var(--color-papel)] transition hover:brightness-125 disabled:opacity-60"
    >
      {pending ? (ocupado ?? "Un momento…") : children}
    </button>
  );
}
