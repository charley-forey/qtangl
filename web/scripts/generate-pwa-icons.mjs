import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const publicDir = path.join(webRoot, "public");
const iconsDir = path.join(publicDir, "icons");
const logoPath = path.join(publicDir, "logo-mark.svg");

const sizes = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
];

async function main() {
  const svg = await readFile(logoPath);
  await mkdir(iconsDir, { recursive: true });

  for (const { name, size, maskable } of sizes) {
    const inset = maskable ? Math.round(size * 0.12) : 0;
    const inner = size - inset * 2;

    const icon = await sharp(svg)
      .resize(inner, inner, { fit: "contain", background: { r: 2, g: 2, b: 2, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 2, g: 2, b: 2, alpha: 1 },
      },
    })
      .composite([{ input: icon, top: inset, left: inset }])
      .png()
      .toFile(path.join(iconsDir, name));

    console.log(`Generated ${name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
