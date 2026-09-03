import "server-only";

import { createHash, randomBytes, randomInt } from "node:crypto";

/**
 * Los tokens y claves se guardan hasheados: si alguien llega a leer la tabla,
 * no obtiene nada con lo que entrar. El valor en claro se muestra una sola vez,
 * al crearlo.
 */
export function hashear(valor: string) {
  return createHash("sha256").update(valor.trim()).digest("hex");
}

/** Token de invitación: largo, aleatorio y seguro para poner en una URL. */
export function nuevoToken() {
  return randomBytes(32).toString("base64url");
}

// Sin I, O, 0 ni 1: esta clave se dicta en voz alta y se teclea a mano.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function nuevaClaveDeInvitada(largo = 8) {
  let clave = "";
  for (let i = 0; i < largo; i++) clave += ALFABETO[randomInt(ALFABETO.length)];
  return `${clave.slice(0, 4)}-${clave.slice(4)}`;
}

/** Normaliza lo que teclea una invitada antes de compararlo. */
export function normalizarClave(valor: string) {
  return valor.trim().toUpperCase().replace(/\s+/g, "");
}
