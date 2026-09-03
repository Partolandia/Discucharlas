import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "discucharlas_invitada";
const DURACION_DIAS = 7;

function secreto() {
  const valor = process.env.GUEST_SESSION_SECRET;
  if (!valor) {
    throw new Error(
      "Falta GUEST_SESSION_SECRET. Genera uno con: openssl rand -base64 32"
    );
  }
  return valor;
}

function firmar(carga: string) {
  return createHmac("sha256", secreto()).update(carga).digest("base64url");
}

/**
 * La invitada no se autentica: no tiene cuenta ni fila en auth.users. Su acceso
 * es una cookie firmada que solo dice "esta clave era válida y cuándo".
 *
 * Guardamos el id del guest_access, no la clave, para poder comprobar en cada
 * petición que sigue activa: así revocarla surte efecto de inmediato, sin
 * esperar a que la cookie caduque.
 */
export async function abrirSesionDeInvitada(idAcceso: string) {
  const expira = Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000;
  const carga = `${idAcceso}.${expira}`;
  const galleta = await cookies();

  galleta.set(COOKIE, `${carga}.${firmar(carga)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_DIAS * 24 * 60 * 60,
  });
}

export async function cerrarSesionDeInvitada() {
  const galleta = await cookies();
  galleta.delete(COOKIE);
}

/** Id del acceso si la cookie es legítima y no ha caducado; null si no. */
export async function accesoDeInvitada(): Promise<string | null> {
  const galleta = await cookies();
  const valor = galleta.get(COOKIE)?.value;
  if (!valor) return null;

  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [id, expira, firma] = partes;

  const esperada = Buffer.from(firmar(`${id}.${expira}`));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) {
    return null;
  }

  if (Number(expira) <= Date.now()) return null;
  return id;
}
