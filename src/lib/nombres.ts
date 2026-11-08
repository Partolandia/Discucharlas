/** "MJ" a partir de "María José": lo que el prototipo pinta en los avatares. */
export function iniciales(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

/**
 * Acento de cada integrante. El prototipo reparte la paleta del club entre las
 * filas; al no guardarse en la base, se deriva del id para que a cada persona
 * le toque siempre el mismo.
 */
const ACENTOS = ["#8e79ad", "#61758d", "#c98389", "#f05d50", "#7f8750", "#c7a05a"];

export function acentoDe(id: string) {
  let suma = 0;
  for (const letra of id) suma = (suma + letra.charCodeAt(0)) % 997;
  return ACENTOS[suma % ACENTOS.length];
}
