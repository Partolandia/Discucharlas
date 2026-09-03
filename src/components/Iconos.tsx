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
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <circle cx="12" cy="15" r="1.8" />
    </svg>
  );
}

export function IconoPropuestas({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8.5 9.5l2 2 4-4M8.5 16h7" />
    </svg>
  );
}

export function IconoComunidad({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v3A2.5 2.5 0 0 1 13.5 12H9l-3 2.5V12h-.5A2.5 2.5 0 0 1 4 9.5z" />
      <path d="M8.5 15.5v.5A2.5 2.5 0 0 0 11 18.5h4l3 2.5V18.5a2.5 2.5 0 0 0 2-2.45V13.5" />
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
