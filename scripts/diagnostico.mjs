/**
 * Estado de esta copia del proyecto. Pega la salida completa cuando algo no
 * cuadre.
 *
 * En Node y no en shell porque npm lanza los scripts con cmd.exe en Windows, y
 * un .sh ahí no arranca.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

function correr(orden, respaldo = "(no disponible)") {
  try {
    return execSync(orden, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return respaldo;
  }
}

console.log(`carpeta:    ${process.cwd()}`);
console.log(`rama:       ${correr("git rev-parse --abbrev-ref HEAD")}`);
console.log(`commit:     ${correr("git rev-parse --short HEAD")}`);
console.log(`remoto:     ${correr("git config --get remote.origin.url")}`);

const enGitHub = correr("git ls-remote --heads origin main");
console.log(`en GitHub:  ${enGitHub.slice(0, 7) || "(no se pudo consultar)"}`);
console.log(`node:       ${process.version}`);

console.log("\n¿/entrar tiene el formulario?");
try {
  const entrar = readFileSync("src/app/entrar/page.tsx", "utf8");
  console.log(
    entrar.includes("FormularioAcceso")
      ? "  sí - el código local está al día"
      : "  NO - esta copia es vieja; falta traer los cambios"
  );
} catch {
  console.log("  no encuentro src/app/entrar/page.tsx: ¿estás en la carpeta del proyecto?");
}

const sinGuardar = correr("git status --short", "");
console.log("\ncambios sin guardar:");
console.log(sinGuardar ? sinGuardar.split("\n").slice(0, 10).map((l) => `  ${l}`).join("\n") : "  ninguno");

console.log(`\ncompilación previa en caché: ${existsSync(".next") ? "sí (.next existe)" : "no"}`);
console.log(`configuración local:         ${existsSync(".env.local") ? "sí (.env.local existe)" : "NO (corre: npm run configurar)"}`);

console.log("\nmigraciones en el disco:");
try {
  const archivos = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  if (archivos.length === 0) throw new Error("vacío");
  for (const f of archivos.sort()) {
    const lineas = readFileSync(`supabase/migrations/${f}`, "utf8").split("\n").length;
    console.log(`  ${f}  (${lineas} líneas)`);
  }
} catch {
  console.log("  NINGUNA - por eso 'supabase db push' diría que no hay nada que aplicar");
}

console.log("\nestado contra el proyecto remoto:");
const lista = correr("npx --no-install supabase migration list", "(no se pudo consultar)");
console.log(lista.split("\n").slice(0, 20).map((l) => `  ${l}`).join("\n"));
