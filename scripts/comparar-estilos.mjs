/**
 * Compara estilos calculados de un selector entre el prototipo y la app.
 *
 *   node scripts/comparar-estilos.mjs <idPantalla> <ruta> <selector> [...props]
 */
import { chromium } from "playwright";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [pantalla, ruta, selector, ...extra] = process.argv.slice(2);
const PROPS = extra.length
  ? extra
  : ["background-color", "border-color", "border-width", "color", "border-radius", "box-shadow"];

const leer = (sel, props) => {
  const el = document.querySelector(sel);
  if (!el) return { ausente: true };
  const c = getComputedStyle(el);
  return Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)]));
};

const navegador = await chromium.launch();

const ctxP = await navegador.newContext({ viewport: { width: 430, height: 932 } });
const proto = await ctxP.newPage();
await proto.addInitScript(() => {
  window.DISC_PRIVATE_IDENTITY = {
    role: "admin",
    name: "Isa",
    userId: "00000000-0000-4000-8000-000000000001",
    bridgeNonce: "estilos",
  };
});
await proto.goto(pathToFileURL(resolve("prototipo-sesiones-v2.html")).href, { waitUntil: "load" });
await proto.waitForTimeout(3500);
await proto.evaluate((p) => window.show?.(p), pantalla);
await proto.waitForTimeout(400);
console.log("prototipo:", JSON.stringify(await proto.evaluate(([s, p, fn]) => new Function("return " + fn)()(s, p), [selector, PROPS, leer.toString()]), null, 1));

const ctxA = await navegador.newContext({ viewport: { width: 430, height: 932 } });
const app = await ctxA.newPage();
await app.goto("http://localhost:3000/entrar", { waitUntil: "networkidle" });
await app.fill('input[name="email"]', "ana@discucharlas.local");
await app.fill('input[name="password"]', process.env.SEMILLA_PASSWORD ?? "discucharlas123");
await app.click('button[type="submit"]');
await app.waitForTimeout(6000);
await app.goto("http://localhost:3000" + ruta, { waitUntil: "networkidle" });
await app.waitForTimeout(800);
console.log("app      :", JSON.stringify(await app.evaluate(([s, p, fn]) => new Function("return " + fn)()(s, p), [selector, PROPS, leer.toString()]), null, 1));

await navegador.close();
