// One-off/maintenance generator for PWA icon PNGs from the brand mark SVG
// (public/icons/mark.svg — the "U" glyph extracted from logo-dark-bg.svg).
//
// Re-run this whenever the brand mark changes:
//   node scripts/generate-pwa-icons.mjs
//
// Requires `sharp`. Not a project dependency (it currently rides along as
// Next.js's own optional dependency for image optimization) — if it's ever
// missing, install it for this one-off run: `npm i -D sharp`.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const markSvg = readFileSync(path.join(root, "public/icons/mark.svg"));

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function renderPadded(size, paddingRatio, background) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const markPng = await sharp(markSvg)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: markPng, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  const outDir = path.join(root, "public/icons");

  // "any" purpose — modest padding, safe for launcher/task-switcher display.
  await sharp(await renderPadded(192, 0.18, WHITE)).toFile(path.join(outDir, "icon-192.png"));
  await sharp(await renderPadded(512, 0.18, WHITE)).toFile(path.join(outDir, "icon-512.png"));

  // "maskable" purpose — larger padding so OS shape masks (circle/squircle)
  // never clip the mark. See https://web.dev/maskable-icon/.
  await sharp(await renderPadded(512, 0.3, WHITE)).toFile(
    path.join(outDir, "icon-maskable-512.png"),
  );

  // iOS home screen icon — must be fully opaque, no transparency.
  await sharp(await renderPadded(180, 0.22, WHITE)).toFile(
    path.join(root, "app/apple-icon.png"),
  );

  console.log("PWA icons written to public/icons/ and app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
