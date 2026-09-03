import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * Sello de la versión que se compiló.
 *
 * Existe para poder responder sin adivinar a "¿qué código estoy corriendo?":
 * basta abrir /version. Si el commit no coincide con el de GitHub, lo que
 * falla es la copia local, no el despliegue.
 */
function versionCompilada() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    // Sin git a la mano (una copia descargada como zip, por ejemplo).
    return "desconocida";
  }
}

/**
 * Orígenes desde los que se permite entrar al servidor de desarrollo.
 *
 * Al abrir la app desde el teléfono o desde otra máquina de la red, la petición
 * llega con un origen distinto de localhost y Next bloquea los recursos de
 * desarrollo: la página queda en blanco. Añade aquí tu IP, o pásala en
 * DEV_ORIGINS separada por comas.
 */
const origenesDeDesarrollo = [
  ...(process.env.DEV_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
  "127.0.0.1",
  "localhost",
];

const nextConfig: NextConfig = {
  allowedDevOrigins: origenesDeDesarrollo,
  env: {
    VERSION_COMPILADA: versionCompilada(),
    COMPILADA_EN: new Date().toISOString(),
  },
};

export default nextConfig;
