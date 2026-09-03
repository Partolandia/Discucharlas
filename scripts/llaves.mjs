/**
 * Reconoce qué es una llave de Supabase y con qué privilegio.
 *
 * Importa porque NEXT_PUBLIC_SUPABASE_ANON_KEY viaja al navegador: si ahí cae
 * por error la llave de servicio, se publica acceso total a la base —
 * incluidas las notas privadas — a cualquiera que abra la página.
 */

/** "publica", "servicio" o null si no se reconoce. */
export function tipoDeLlave(llave) {
  if (!llave) return null;
  const valor = llave.trim();

  // Formato nuevo de Supabase.
  if (valor.startsWith("sb_publishable_")) return "publica";
  if (valor.startsWith("sb_secret_")) return "servicio";

  // Formato anterior: un JWT que lleva el rol en su carga.
  const partes = valor.split(".");
  if (partes.length === 3) {
    try {
      const carga = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8"));
      if (carga.role === "anon") return "publica";
      if (carga.role === "service_role") return "servicio";
    } catch {
      // No es un JWT legible; lo tratamos como desconocido.
    }
  }
  return null;
}

/** Mensaje de alerta si una llave está en la ranura equivocada, o null. */
export function llaveMalColocada(llave, ranura) {
  const tipo = tipoDeLlave(llave);
  if (!tipo) return null;

  if (ranura === "publica" && tipo === "servicio") {
    return (
      "Esa es la llave de SERVICIO y va en la ranura pública, que se publica en " +
      "el navegador. Cualquiera podría leer toda la base, notas privadas incluidas. " +
      "Cámbiala por la pública (anon / publishable) y rota la de servicio en Supabase."
    );
  }
  if (ranura === "servicio" && tipo === "publica") {
    return "Esa es la llave pública. En esta ranura va la de servicio (service_role / secret).";
  }
  return null;
}
