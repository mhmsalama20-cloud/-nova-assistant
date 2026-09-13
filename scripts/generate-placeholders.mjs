/**
 * Generates the branded SVG placeholders referenced by `src/config/media.ts`.
 *
 *   npm run images:placeholders
 *
 * Each placeholder is a real, valid image at the exact dimensions the layout
 * reserves, so nothing shifts when you swap in real photography.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "images");

const VIOLET = "#6D28D9";
const VIOLET_SOFT = "#EDE7FE";
const YELLOW = "#FFB703";
const BEIGE = "#FAF6EF";
const INK = "#2A1A4A";

/** Slots mirror src/config/media.ts. Keep the two in sync. */
const slots = [
  ["hero-q30", 1200, 1200, "Hero — Q30 + phone + labelled jars"],
  ["step-1-type", 900, 700, "Step 1 — typing a label on the phone"],
  ["step-2-design", 900, 700, "Step 2 — choosing the layout"],
  ["step-3-print", 900, 700, "Step 3 — print, stick, done"],
  ["use-kitchen", 800, 800, "Use case — kitchen jars"],
  ["use-kids", 800, 800, "Use case — kids' room bins"],
  ["use-study", 800, 800, "Use case — study folders"],
  ["use-office", 800, 800, "Use case — office and cables"],
  ["use-packaging", 800, 800, "Use case — order packaging"],
  ["use-gifts", 800, 800, "Use case — gift tags"],
  ["gallery-1-front", 1000, 1000, "Gallery — Q30 front view"],
  ["gallery-2-hand", 1000, 1000, "Gallery — Q30 in hand, for scale"],
  ["gallery-3-roll", 1000, 1000, "Gallery — 15 mm roll inside"],
  ["gallery-4-app", 1000, 1000, "Gallery — printer with the app"],
  ["gallery-5-labels", 1000, 1000, "Gallery — finished labels"],
  ["before-clutter", 900, 700, "Before — unlabelled clutter"],
  ["after-order", 900, 700, "After — labelled and tidy"],
  ["offer-single", 700, 700, "Offer — one printer"],
  ["offer-bundle", 700, 700, "Offer — 1+1 bundle"],
  ["og-share", 1200, 630, "Open Graph share image"],
];

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A simple, recognisable label-printer glyph drawn to a 100×100 box. */
function printerGlyph(cx, cy, size) {
  const s = size / 100;
  const t = (x, y) => `${(cx + (x - 50) * s).toFixed(2)},${(cy + (y - 50) * s).toFixed(2)}`;
  return `
    <g>
      <rect x="${cx - 34 * s}" y="${cy - 26 * s}" width="${68 * s}" height="${52 * s}" rx="${12 * s}" fill="${VIOLET}"/>
      <rect x="${cx - 22 * s}" y="${cy - 14 * s}" width="${44 * s}" height="${10 * s}" rx="${5 * s}" fill="${VIOLET_SOFT}" opacity="0.55"/>
      <rect x="${cx - 24 * s}" y="${cy + 18 * s}" width="${48 * s}" height="${30 * s}" rx="${5 * s}" fill="#FFFFFF" stroke="${INK}" stroke-width="${2 * s}"/>
      <rect x="${cx - 16 * s}" y="${cy + 26 * s}" width="${32 * s}" height="${3.5 * s}" rx="${1.75 * s}" fill="${INK}" opacity="0.75"/>
      <rect x="${cx - 16 * s}" y="${cy + 34 * s}" width="${22 * s}" height="${3.5 * s}" rx="${1.75 * s}" fill="${INK}" opacity="0.4"/>
      <circle cx="${cx + 22 * s}" cy="${cy - 16 * s}" r="${4 * s}" fill="${YELLOW}"/>
      <polyline points="${t(30, 74)} ${t(50, 74)}" stroke="none" fill="none"/>
    </g>`;
}

function svg(name, w, h, caption) {
  const glyph = Math.min(w, h) * 0.3;
  const cx = w / 2;
  const cy = h * 0.42;
  const base = Math.min(w, h);
  const titleSize = Math.max(15, base * 0.036);
  const metaSize = Math.max(12, base * 0.026);
  const pad = base * 0.05;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(caption)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BEIGE}"/>
      <stop offset="100%" stop-color="${VIOLET_SOFT}"/>
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="${VIOLET}" opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" rx="${base * 0.045}"
        fill="none" stroke="${VIOLET}" stroke-opacity="0.28" stroke-width="${Math.max(2, base * 0.005)}" stroke-dasharray="${base * 0.035} ${base * 0.025}"/>
  ${printerGlyph(cx, cy, glyph)}
  <text x="${cx}" y="${h * 0.74}" text-anchor="middle" font-family="Rubik, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="${titleSize}" font-weight="700" fill="${INK}">${escape(caption)}</text>
  <text x="${cx}" y="${h * 0.74 + titleSize * 1.7}" text-anchor="middle" font-family="Rubik, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="${metaSize}" font-weight="500" fill="${VIOLET}" opacity="0.95">${name} · ${w}×${h}</text>
  <text x="${cx}" y="${h * 0.74 + titleSize * 1.7 + metaSize * 1.8}" text-anchor="middle" font-family="Rubik, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="${metaSize}" font-weight="400" fill="${INK}" opacity="0.55">Replace with a real Q30 photo</text>
</svg>
`;
}

await mkdir(outDir, { recursive: true });
for (const [name, w, h, caption] of slots) {
  await writeFile(resolve(outDir, `${name}.svg`), svg(name, w, h, caption), "utf8");
}
console.log(`Wrote ${slots.length} placeholder images to public/images/`);
