/**
 * Muestra en consola la org, los proyectos y los enlaces directos al panel.
 * Sirve cuando el dashboard no lista lo mismo que la CLI (cuenta distinta).
 *
 *   npm run panel-supabase
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function json(orden) {
  try {
    return JSON.parse(execSync(orden, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (fallo) {
    console.error("No pude hablar con Supabase. ¿Iniciaste sesión?\n");
    console.error("  npx supabase login\n");
    if (fallo.stderr) console.error(String(fallo.stderr).trim());
    process.exit(1);
  }
}

const orgs = json("npx supabase orgs list -o json");
const proyectos = json("npx supabase projects list -o json");

console.log("\nCuenta de la CLI de Supabase (la que importa para este equipo):\n");

for (const org of orgs.organizations ?? orgs) {
  const slug = org.slug ?? org.organization_slug;
  const nombre = org.name ?? slug;
  console.log(`  Organización: ${nombre}`);
  console.log(`  Panel org:      https://supabase.com/dashboard/org/${org.id}\n`);
}

if (!proyectos.length) {
  console.log("  No hay proyectos en esta cuenta.\n");
  process.exit(0);
}

let refEnLocal = "";
if (existsSync(".env.local")) {
  const m = readFileSync(".env.local", "utf8").match(
    /NEXT_PUBLIC_SUPABASE_URL=https:\/\/([^.]+)\.supabase\.co/
  );
  if (m) refEnLocal = m[1];
}

console.log("  Proyectos:\n");
for (const p of proyectos) {
  const marca =
    p.ref === refEnLocal ? "  ← este usa la app (.env.local)" : p.linked ? "  ← vinculado con supabase link" : "";
  console.log(`    ${p.name}`);
  console.log(`      ref:     ${p.ref}`);
  console.log(`      estado:  ${p.status}`);
  console.log(`      panel:   https://supabase.com/dashboard/project/${p.ref}${marca}\n`);
}

console.log("Si el navegador no muestra estos proyectos:");
console.log("  1. Cierra sesión en https://supabase.com/dashboard");
console.log("  2. En Git Bash:  npx supabase login");
console.log("  3. Entra con la misma cuenta que en el paso 2");
console.log("  4. Arriba a la izquierda elige la organización listada aquí\n");
