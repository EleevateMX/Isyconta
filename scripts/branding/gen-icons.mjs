// Generador de assets de marca Isyconta (logo palmera + iconos PWA).
// Recrea el símbolo de la palmera (tronco azul + hojas verdes) como SVG vectorial
// y rasteriza los PNG/favicon que iOS/Android prefieren.
//
// Uso:  pnpm icons:gen   (sharp y png-to-ico están en devDependencies)
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const ICONS = join(ROOT, "public", "icons");
const APP = join(ROOT, "src", "app");

// ── Paleta oficial Isyconta ──────────────────────────────────────────────────
const AZUL = "#2323c7"; // tronco / royal blue
const VERDE = "#2fa82d"; // hojas / verde
const VERDE_OSC = "#249021";
const BLANCO = "#ffffff";

// ── Símbolo: palmera ─────────────────────────────────────────────────────────
// Pivote = punto donde nacen las hojas (parte alta del tronco).
const PIVOT = { x: 256, y: 232 };

// Blade de una hoja: fronda ancha tipo plátano, dibujada a lo largo de +x
// con la base en (0,0) y la punta a la derecha.
function leaf(scale, fill) {
  const blade = "M0 0 C 55 -50 150 -48 214 -18 C 150 6 70 18 0 0 Z";
  return { blade, scale, fill };
}

// Hoja central: división tipo "rayo" en blanco (como el logo real).
const RAYO = "M14 -3 L 70 -23 L 58 -16 L 130 -31 L 116 -24 L 205 -17";

// Hojas: ángulo (grados, 0 = derecha, negativo = hacia arriba), escala.
// Solo la fronda central lleva el rayo blanco; el resto son verdes sólidas y
// la separación la dan los espacios entre hojas (como en el logo original).
const HOJAS = [
  { deg: -166, ...leaf(0.82, VERDE_OSC) },
  { deg: -128, ...leaf(0.96, VERDE) },
  { deg: -90, ...leaf(1.08, VERDE), vein: RAYO }, // central, lleva el rayo
  { deg: -52, ...leaf(1.02, VERDE) },
  { deg: -14, ...leaf(0.86, VERDE_OSC) },
];

function palmera() {
  const tronco = `<rect x="232" y="236" width="48" height="246" rx="24" fill="${AZUL}"/>`;
  const hojas = HOJAS.map((h) => {
    const vein = h.vein
      ? `<path d="${h.vein}" fill="none" stroke="${BLANCO}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
      : "";
    return (
      `<g transform="translate(${PIVOT.x} ${PIVOT.y}) rotate(${h.deg}) scale(${h.scale})">` +
      `<path d="${h.blade}" fill="${h.fill}"/>${vein}</g>`
    );
  }).join("");
  // Las hojas se dibujan después del tronco para tapar su nacimiento.
  return tronco + hojas;
}

const SYMBOL = palmera();

// ── 1. logo-symbol.svg (fondo transparente, para superficies claras) ─────────
const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
${SYMBOL}
</svg>`;
writeFileSync(join(ICONS, "logo-symbol.svg"), symbolSvg + "\n");

// ── 2. icon.svg (maskable, fondo blanco con safe-area) ───────────────────────
// Android enmascara con círculo; centramos el símbolo al ~64% para el safe zone.
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="0" fill="${BLANCO}"/>
  <g transform="translate(256 262) scale(0.66) translate(-256 -262)">
${SYMBOL}
  </g>
</svg>`;
writeFileSync(join(ICONS, "icon.svg"), maskSvg + "\n");

// ── Rasterización ────────────────────────────────────────────────────────────
const { default: sharp } = await import("sharp");
let pngToIco;
try {
  pngToIco = (await import("png-to-ico")).default;
} catch {
  pngToIco = null;
}

const maskBuf = Buffer.from(maskSvg);
const symBuf = Buffer.from(symbolSvg);

async function png(svgBuf, size, out) {
  await sharp(svgBuf, { density: 384 }).resize(size, size).png().toFile(out);
  console.log("·", out.replace(ROOT + "/", ""));
}

// Iconos PWA maskable (fondo blanco) — referenciados por el manifest
await png(maskBuf, 192, join(ICONS, "icon-192.png"));
await png(maskBuf, 512, join(ICONS, "icon-512.png"));
// Símbolo transparente para usos sueltos (slides, correos, etc.)
await png(symBuf, 512, join(ICONS, "logo-symbol-512.png"));
// Apple touch icon (convención app-router: src/app/apple-icon.png)
await png(maskBuf, 180, join(APP, "apple-icon.png"));
// Favicon SVG moderno (convención app-router: src/app/icon.svg)
writeFileSync(join(APP, "icon.svg"), maskSvg + "\n");
console.log("· src/app/icon.svg");

// favicon.ico multi-resolución
if (pngToIco) {
  const sizes = await Promise.all(
    [16, 32, 48].map((s) =>
      sharp(maskBuf, { density: 384 }).resize(s, s).png().toBuffer(),
    ),
  );
  const ico = await pngToIco(sizes);
  writeFileSync(join(APP, "favicon.ico"), ico);
  console.log("· src/app/favicon.ico");
} else {
  console.log("! png-to-ico no disponible: omitido favicon.ico");
}

console.log("\nListo. Assets de marca generados.");
