// Colores de avatar tomados de la paleta del prototipo. Se reparten por el id
// para que cada integrante conserve siempre el suyo.
const COLORES = [
  "var(--color-subpagina)",
  "var(--color-comunidad)",
  "var(--color-calendario)",
  "var(--color-inicio)",
  "var(--color-club)",
  "var(--color-propuestas)",
];

function colorDe(id: string) {
  let suma = 0;
  for (const c of id) suma = (suma + c.charCodeAt(0)) % 997;
  return COLORES[suma % COLORES.length];
}

export function Avatar({
  id,
  nombre,
  tamano = 48,
}: {
  id: string;
  nombre: string;
  tamano?: number;
}) {
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{
        background: colorDe(id),
        width: tamano,
        height: tamano,
        fontSize: Math.round(tamano * 0.34),
      }}
    >
      {iniciales}
    </span>
  );
}
