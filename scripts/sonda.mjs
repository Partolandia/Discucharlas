/**
 * Sonda de diagnóstico: entra a una ruta y describe los elementos que le
 * interesan, con su caja y sus estilos calculados. Sirve para averiguar por qué
 * algo se ve distinto al prototipo sin tener que adivinar leyendo CSS.
 *
 *   node scripts/sonda.mjs [ruta] [selector...]
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

try {
  for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // Sin .env.local usamos lo que ya esté en el entorno.
}

const base = "http://localhost:3000";
const ruta = process.argv[2] ?? "/inicio";
const selectores = process.argv.slice(3);

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 430, height: 932 } });

await pagina.goto(`${base}/entrar`, { waitUntil: "networkidle" });
await pagina.fill('input[name="email"]', "ana@discucharlas.local");
await pagina.fill('input[name="password"]', "discucharlas123");
await pagina.click('button[type="submit"]');
await pagina.waitForTimeout(5000);
await pagina.goto(base + ruta, { waitUntil: "networkidle" });

for (const selector of selectores) {
  const informe = await pagina.evaluate((sel) => {
    const salida = [];
    for (const el of document.querySelectorAll(sel)) {
      const c = getComputedStyle(el);
      const antes = getComputedStyle(el, "::before");
      const despues = getComputedStyle(el, "::after");
      const caja = el.getBoundingClientRect();
      salida.push({
        etiqueta: el.tagName.toLowerCase() + "." + String(el.className || "").trim(),
        texto: (el.textContent || "").trim().slice(0, 40),
        caja: `${Math.round(caja.width)}x${Math.round(caja.height)}`,
        display: c.display,
        radio: c.borderRadius,
        fondo: c.backgroundColor,
        flex: `${c.flexDirection} ${c.alignItems}`,
        antes: antes.content !== "none" ? `${antes.content} ${antes.width}x${antes.height} ${antes.backgroundColor}` : null,
        despues: despues.content !== "none" ? `${despues.content} ${despues.width}x${despues.height} ${despues.backgroundColor}` : null,
        hijos: [...el.children].map((h) => h.tagName.toLowerCase() + "." + String(h.className || "")).join(" | "),
      });
    }
    return salida;
  }, selector);

  console.log(`\n=== ${selector}`);
  for (const i of informe) console.log(JSON.stringify(i, null, 2));
}

await navegador.close();
