type Props = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconoInicio({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function IconoCalendario({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.8h17M8 3v4M16 3v4" />
    </svg>
  );
}

/** Propuestas: la voz que suena, no una lista de tareas. */
export function IconoPropuestas({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M16 9.2a4 4 0 0 1 0 5.6" />
      <path d="M18.6 6.8a7.5 7.5 0 0 1 0 10.4" />
    </svg>
  );
}

export function IconoComunidad({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M20 13.5A3.5 3.5 0 0 1 16.5 17H10l-4 3.2V17h-.5A3.5 3.5 0 0 1 2 13.5v-6A3.5 3.5 0 0 1 5.5 4h11A3.5 3.5 0 0 1 20 7.5z" />
    </svg>
  );
}

export function IconoClub({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19c0-2.2-.9-4-2.3-5" />
    </svg>
  );
}

export function IconoCampana({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M18 15.5V10a6 6 0 1 0-12 0v5.5L4.5 18h15z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

export function IconoAjustes({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.3 14.6a1.5 1.5 0 0 0 .3 1.65l.05.05a1.8 1.8 0 1 1-2.55 2.55l-.05-.05a1.5 1.5 0 0 0-1.65-.3 1.5 1.5 0 0 0-.9 1.37v.13a1.8 1.8 0 1 1-3.6 0v-.07a1.5 1.5 0 0 0-.98-1.37 1.5 1.5 0 0 0-1.65.3l-.05.05a1.8 1.8 0 1 1-2.55-2.55l.05-.05a1.5 1.5 0 0 0 .3-1.65 1.5 1.5 0 0 0-1.37-.9h-.13a1.8 1.8 0 1 1 0-3.6h.07a1.5 1.5 0 0 0 1.37-.98 1.5 1.5 0 0 0-.3-1.65l-.05-.05A1.8 1.8 0 1 1 8.19 4.4l.05.05a1.5 1.5 0 0 0 1.65.3h.07a1.5 1.5 0 0 0 .9-1.37v-.13a1.8 1.8 0 1 1 3.6 0v.07a1.5 1.5 0 0 0 .9 1.37 1.5 1.5 0 0 0 1.65-.3l.05-.05a1.8 1.8 0 1 1 2.55 2.55l-.05.05a1.5 1.5 0 0 0-.3 1.65v.07a1.5 1.5 0 0 0 1.37.9h.13a1.8 1.8 0 1 1 0 3.6h-.07a1.5 1.5 0 0 0-1.37.9z" />
    </svg>
  );
}

export function IconoCorazon({ className, relleno }: Props & { relleno?: boolean }) {
  return (
    <svg {...base} className={className} fill={relleno ? "currentColor" : "none"}>
      <path d="M12 20s-7.2-4.5-7.2-9.4A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z" />
    </svg>
  );
}
