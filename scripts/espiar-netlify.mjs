/**
 * Vuelca el DOM de una pantalla del prototipo desplegado en Netlify.
 *
 * El HTML que tenemos en local va por detrás de ese despliegue, así que para
 * copiar una pantalla con fidelidad hay que mirarla ahí. Las credenciales
 * llegan por variables de entorno a propósito: no se guardan en el repo.
 *
 *   PROTO_URL=... PROTO_USER=... PROTO_PASS=... \
 *     node scripts/espiar-netlify.mjs <idPantalla> [salida.html]
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const url = process.env.PROTO_URL;
const usuario = process.env.PROTO_USER;
const clave = process.env.PROTO_PASS;
const pantalla = process.argv[2];
const salida = process.argv[3] ?? `.prototipo/netlify-${pantalla}.html`;

if (!url || !usuario || !clave || !pantalla) {
  console.error("Faltan PROTO_URL, PROTO_USER, PROTO_PASS o el id de pantalla.");
  process.exit(1);
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 430, height: 932 } });
pagina.on("console", (m) => {
  if (m.type() === "error") console.log("  [consola]", m.text().slice(0, 160));
});

await pagina.goto(url, { waitUntil: "networkidle" });

/** El despliegue envuelve el prototipo en un iframe con su barra de nube. */
async function marco() {
  for (const f of pagina.frames()) {
    const tiene = await f.evaluate(() => Boolean(document.querySelector("section.page"))).catch(() => false);
    if (tiene) return f;
  }
  return null;
}

const inventario = async () => {
  const f = await marco();
  if (!f) return [];
  return f.evaluate(() => [...document.querySelectorAll("section.page")].map((s) => s.id));
};

console.log("pantallas al abrir:", (await inventario()).join(", ") || "ninguna");

// El prototipo pide correo y contraseña en su propia pantalla de acceso.
const correo = pagina.locator('input[type="email"]').first();
if (await correo.count()) {
  const contrasena = pagina.locator('input[type="password"], input[name="password"]').first();
  await correo.click();
  await correo.pressSequentially(usuario, { delay: 15 });
  await contrasena.click();
  await contrasena.pressSequentially(clave, { delay: 15 });
  console.log("campos:", (await correo.inputValue()).length, (await contrasena.inputValue()).length);

  const entrar = pagina.locator("button", { hasText: /entrar|ingresar|acceder/i }).first();
  if (await entrar.count()) await entrar.click();
  else await contrasena.press("Enter");
  await pagina.waitForTimeout(9000);
  console.log("pantallas tras entrar:", (await inventario()).join(", ") || "ninguna");
}

const dentro = await marco();
if (dentro) {
  await dentro.evaluate((id) => window.show?.(id), pantalla);
  await pagina.waitForTimeout(5000);
}

const html = dentro
  ? await dentro.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      // Las imágenes en base64 pesan megas y no aportan al marcado.
      const copia = el.cloneNode(true);
      for (const img of copia.querySelectorAll("img")) {
        if (img.src.startsWith("data:")) img.setAttribute("src", "ELIDIDO");
      }
      return copia.outerHTML;
    }, pantalla)
  : null;

await pagina.screenshot({ path: `.prototipo/netlify-${pantalla}.png`, fullPage: true });
await navegador.close();

if (!html) {
  console.error(`No se encontró la pantalla "${pantalla}".`);
  process.exit(1);
}

writeFileSync(salida, html, "utf8");
console.log(`${salida} · ${html.length} caracteres`);
