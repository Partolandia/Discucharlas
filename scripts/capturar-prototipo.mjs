/**
 * Abre el prototipo en un navegador real y guarda, pantalla por pantalla, el
 * DOM final y una captura.
 *
 * Hace falta porque el prototipo reescribe secciones enteras en tiempo de
 * ejecución (p. ej. `discucharlas-entrega1` sustituye el innerHTML de
 * #votacion y #voto). Leer el marcado estático lleva a copiar una versión que
 * nadie ve.
 *
 *   node scripts/capturar-prototipo.mjs prototipo-sesiones-v2.html
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const entrada = resolve(process.argv[2] ?? "prototipo-sesiones-v2.html");
const salida = resolve(process.argv[3] ?? ".prototipo/pantallas");
mkdirSync(salida, { recursive: true });

const PANTALLAS = [
  "inicio", "calendario", "votacion", "voto", "proponer",
  "club-proposals", "club-history",
  "comunidad", "nueva-conversacion", "hilo",
  "club", "perfil", "solicitar-invitacion",
  "sesion", "archivo", "guia",
  "notificaciones", "ajustes",
  "administracion", "crear", "accesos", "miembros-admin", "exportar-historial",
  "invitado", "crear-cuenta-invitacion",
];

const sinBase64 = (s) =>
  s.replace(/data:image\/([a-z+]+);base64,[A-Za-z0-9+/=]+/g, "data:image/$1;base64,ELIDIDO");

const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
});

const errores = [];
pagina.on("pageerror", (e) => {
  errores.push(String(e));
  console.log(`  ! ${String(e).split("\n")[0]}`);
});
pagina.on("console", (m) => {
  if (m.type() === "error") errores.push(`console: ${m.text()}`);
});

// El prototipo espera que su anfitrión le inyecte la identidad en el hueco
// /*DISC_PRIVATE_IDENTITY*/. Sin esto, `let role = ...` lanza y deja media
// aplicación sin inicializar.
await pagina.addInitScript(() => {
  window.DISC_PRIVATE_IDENTITY = {
    role: "admin",
    name: "Isa",
    userId: "00000000-0000-4000-8000-000000000001",
    bridgeNonce: "captura",
  };
});

await pagina.goto(pathToFileURL(entrada).href, { waitUntil: "load" });
// Los bloques tardíos se montan con timers; sin esta espera se captura el DOM
// anterior a la reescritura.
await pagina.waitForTimeout(2500);

const resumen = [];

for (const id of PANTALLAS) {
  const existe = await pagina.evaluate((p) => Boolean(document.getElementById(p)), id);
  if (!existe) {
    resumen.push({ id, estado: "no existe" });
    continue;
  }

  try {
    await pagina.evaluate((p) => window.show(p), id);
  } catch (fallo) {
    errores.push(`show(${id}): ${fallo.message.split("\n")[0]}`);
  }
  await pagina.waitForTimeout(600);

  const datos = await pagina.evaluate((p) => {
    const sec = document.getElementById(p);
    return {
      titulo: document.getElementById("title")?.textContent ?? "",
      seccion: document.querySelector(".phone")?.dataset.section ?? "",
      clases: sec?.className ?? "",
      html: sec?.outerHTML ?? "",
      alto: sec?.scrollHeight ?? 0,
    };
  }, id);

  writeFileSync(join(salida, `${id}.html`), sinBase64(datos.html));
  await pagina.screenshot({ path: join(salida, `${id}.png`), fullPage: true });

  resumen.push({
    id,
    estado: "ok",
    titulo: datos.titulo,
    seccion: datos.seccion,
    clases: datos.clases,
    alto: datos.alto,
    kb: Math.round(sinBase64(datos.html).length / 1024),
  });
  console.log(`${id.padEnd(26)} "${datos.titulo}"  ${Math.round(sinBase64(datos.html).length / 1024)} kb`);
}

writeFileSync(join(salida, "_resumen.json"), JSON.stringify({ resumen, errores }, null, 2));
if (errores.length) console.log(`\nerrores de página: ${errores.length}\n${errores.slice(0, 5).join("\n")}`);

await navegador.close();
