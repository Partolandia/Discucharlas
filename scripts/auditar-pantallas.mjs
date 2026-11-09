/**
 * Compara el DOM del prototipo con el de la app, pantalla por pantalla.
 *
 * Comparar capturas a ojo se me escapa cosas. Esto recoge el conjunto de
 * identificadores y clases que el prototipo pinta en cada pantalla y lo resta
 * del que pinta la app: lo que sobra es lo que falta por portar.
 *
 *   node scripts/auditar-pantallas.mjs [idPantalla]
 */
import { chromium } from "playwright";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const CORREO = process.env.SEMILLA_EMAIL ?? "ana@discucharlas.local";
const CLAVE = process.env.SEMILLA_PASSWORD ?? "discucharlas123";

/** id de pantalla del prototipo → ruta de la app. */
const PANTALLAS = {
  inicio: "/inicio",
  calendario: "/calendario",
  votacion: "/propuestas",
  "club-proposals": "/propuestas/lista",
  "club-history": "/propuestas/historial",
  voto: "/propuestas/votar",
  proponer: "/propuestas/nueva",
  comunidad: "/comunidad",
  "nueva-conversacion": "/comunidad/nueva",
  club: "/club",
  "solicitar-invitacion": "/club/proponer",
  perfil: "/perfil",
  archivo: "/nuestras-discucharlas",
  guia: "/guia",
  notificaciones: "/avisos",
  administracion: "/admin",
  accesos: "/admin/accesos",
  "miembros-admin": "/admin/integrantes",
  crear: "/admin/discucharlas",
};

/** Recoge ids, clases y textos cortos visibles dentro de un contenedor. */
const RECOGER = (raiz) => {
  if (!raiz) return { ids: [], clases: [], textos: [] };
  const ids = new Set();
  const clases = new Set();
  const textos = new Set();
  for (const el of raiz.querySelectorAll("*")) {
    if (el.id) ids.add(el.id);
    for (const c of el.classList) clases.add(c);
    // Solo el texto propio del nodo, para no repetir el de los hijos.
    const propio = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      // React parte el texto en más nodos que el prototipo (`{" "}`), así que
      // los espacios de más no cuentan como diferencia.
      .replace(/\s+/g, " ")
      .trim();
    if (propio && propio.length < 90) textos.add(propio);
  }
  return { ids: [...ids], clases: [...clases], textos: [...textos] };
};

const navegador = await chromium.launch();

// --------------------------------------------------------------------------
// prototipo
// --------------------------------------------------------------------------
const ctxP = await navegador.newContext({ viewport: { width: 430, height: 932 } });
const proto = await ctxP.newPage();
await proto.addInitScript(() => {
  window.DISC_PRIVATE_IDENTITY = {
    role: "admin",
    name: "Isa",
    userId: "00000000-0000-4000-8000-000000000001",
    bridgeNonce: "auditoria",
  };
});
await proto.goto(pathToFileURL(resolve("prototipo-sesiones-v2.html")).href, { waitUntil: "load" });
await proto.waitForTimeout(3500);

const delPrototipo = {};
for (const id of Object.keys(PANTALLAS)) {
  await proto.evaluate((p) => window.show?.(p), id).catch(() => {});
  await proto.waitForTimeout(220);
  delPrototipo[id] = await proto.evaluate(
    ([p, fn]) => new Function("return " + fn)()(document.getElementById(p)),
    [id, RECOGER.toString()],
  );
}
// El marco (barras fijas) se mira aparte: no pertenece a ninguna pantalla.
delPrototipo.__marco = await proto.evaluate(
  (fn) => {
    const phone = document.querySelector(".phone");
    const copia = phone.cloneNode(true);
    copia.querySelectorAll(".page").forEach((n) => n.remove());
    return new Function("return " + fn)()(copia);
  },
  RECOGER.toString(),
);

// --------------------------------------------------------------------------
// app
// --------------------------------------------------------------------------
const ctxA = await navegador.newContext({ viewport: { width: 430, height: 932 } });
const app = await ctxA.newPage();
await app.goto(`${BASE}/entrar`, { waitUntil: "networkidle" });
await app.fill('input[name="email"]', CORREO);
await app.fill('input[name="password"]', CLAVE);
await app.click('button[type="submit"]');
await app.waitForTimeout(6000);

const soloUna = process.argv[2];
const informe = [];

for (const [id, ruta] of Object.entries(PANTALLAS)) {
  if (soloUna && id !== soloUna) continue;
  await app.goto(BASE + ruta, { waitUntil: "networkidle" });
  await app.waitForTimeout(600);

  const mio = await app.evaluate(
    ([p, fn]) => {
      const recoger = new Function("return " + fn)();
      // La app monta la pantalla con su id; si no, se toma la .page activa.
      return recoger(document.getElementById(p) ?? document.querySelector(".page"));
    },
    [id, RECOGER.toString()],
  );

  const suyo = delPrototipo[id];
  const faltan = (a, b) => a.filter((x) => !b.includes(x));

  const bloque = {
    pantalla: id,
    ruta,
    idsQueFaltan: faltan(suyo.ids, mio.ids),
    clasesQueFaltan: faltan(suyo.clases, mio.clases),
    textosQueFaltan: faltan(suyo.textos, mio.textos),
  };
  informe.push(bloque);
}

if (!soloUna) {
  const marco = await app.evaluate(
    (fn) => {
      const phone = document.querySelector(".phone");
      const copia = phone.cloneNode(true);
      copia.querySelectorAll(".page").forEach((n) => n.remove());
      return new Function("return " + fn)()(copia);
    },
    RECOGER.toString(),
  );
  const faltan = (a, b) => a.filter((x) => !b.includes(x));
  informe.unshift({
    pantalla: "__marco (barras fijas)",
    ruta: "—",
    idsQueFaltan: faltan(delPrototipo.__marco.ids, marco.ids),
    clasesQueFaltan: faltan(delPrototipo.__marco.clases, marco.clases),
    textosQueFaltan: faltan(delPrototipo.__marco.textos, marco.textos),
  });
}

await navegador.close();

fs.mkdirSync(".prototipo", { recursive: true });
fs.writeFileSync(".prototipo/auditoria.json", JSON.stringify(informe, null, 2));

for (const b of informe) {
  const total = b.idsQueFaltan.length + b.clasesQueFaltan.length + b.textosQueFaltan.length;
  if (!total) {
    console.log(`\n== ${b.pantalla}  ·  al día`);
    continue;
  }
  console.log(`\n== ${b.pantalla}  (${b.ruta})`);
  if (b.idsQueFaltan.length) console.log("   ids    :", b.idsQueFaltan.join(", "));
  if (b.clasesQueFaltan.length) console.log("   clases :", b.clasesQueFaltan.join(", "));
  if (b.textosQueFaltan.length) console.log("   textos :", b.textosQueFaltan.map((t) => `“${t}”`).join(" · "));
}
console.log("\nDetalle completo en .prototipo/auditoria.json");
