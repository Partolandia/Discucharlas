// Genera los PNG del manifest a partir del SVG maestro.
import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("public/icono.svg");

// Icono maskable: el mismo mark sobre un lienzo con zona segura (~20% de margen)
// para que Android pueda recortarlo en círculo sin comerse la letra.
const maskable = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#DD5A44"/>
  <text x="256" y="262" fill="#FBF6EE" font-family="Georgia, serif"
        font-size="200" text-anchor="middle" dominant-baseline="central">D</text>
</svg>`);

const salidas = [
  [svg, 192, "public/icono-192.png"],
  [svg, 512, "public/icono-512.png"],
  [maskable, 512, "public/icono-maskable-512.png"],
  [svg, 180, "public/apple-touch-icon.png"],
];

for (const [fuente, tam, destino] of salidas) {
  await sharp(fuente, { density: 400 }).resize(tam, tam).png().toFile(destino);
  console.log(`  ${destino} (${tam}px)`);
}
