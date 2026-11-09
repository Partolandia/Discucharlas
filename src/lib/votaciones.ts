/**
 * Cómo se cuenta y se cuenta-en-palabras el resultado de una votación.
 *
 * El prototipo v2 sustituyó el texto «Resultado por votos: A / B · 1 voto por
 * episodio», que se leía mal, por una frase explícita de ganadora o empate.
 */

export type Conteo = Map<string | null, number>;

/** Las propuestas más votadas y cuántos votos tienen. Vacío si nadie votó. */
export function masVotadas(votos: Conteo) {
  const maximo = Math.max(0, ...votos.values());
  if (maximo === 0) return { maximo: 0, lideres: [] as string[] };
  const lideres = [...votos.entries()]
    .filter(([id, n]) => n === maximo && id)
    .map(([id]) => id as string);
  return { maximo, lideres };
}

/** La frase que el prototipo muestra en `#clubVoteLeaders`. */
export function resultadoEnPalabras(votos: Conteo, titulos: Map<string, string>) {
  const { maximo, lideres } = masVotadas(votos);
  if (!maximo) return "No se registraron votos en esta votación.";

  const nombre = (id: string) => `“${titulos.get(id) ?? "Propuesta"}”`;
  const unidad = `${maximo} ${maximo === 1 ? "voto" : "votos"}`;

  if (lideres.length > 1) {
    return `Empate: ${lideres.map(nombre).join(" y ")}. Cada opción recibió ${unidad}.`;
  }
  return `Más votado: ${nombre(lideres[0])}, con ${unidad}.`;
}
