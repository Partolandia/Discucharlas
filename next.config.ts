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

const nextConfig: NextConfig = {
  env: {
    VERSION_COMPILADA: versionCompilada(),
    COMPILADA_EN: new Date().toISOString(),
  },
};

export default nextConfig;
