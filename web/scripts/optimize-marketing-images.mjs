#!/usr/bin/env node
/**
 * Resize and recompress public/marketing/*.webp for faster first paint.
 * Card display width is ~400px max; 1024px source + q75 keeps retina sharpness.
 */
import { readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const marketingDir = path.join(__dirname, "..", "public", "marketing");
const MAX_WIDTH = 1024;
const WEBP_QUALITY = 75;

async function optimizeFile(filePath) {
  const before = (await stat(filePath)).size;
  const buffer = await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toBuffer();
  const tmpPath = `${filePath}.tmp`;
  await writeFile(tmpPath, buffer);
  await rename(tmpPath, filePath);
  const after = buffer.length;
  const name = path.basename(filePath);
  console.log(`${name}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`);
  return { before, after };
}

async function main() {
  const entries = await readdir(marketingDir);
  const files = entries.filter((name) => name.endsWith(".webp"));
  if (!files.length) {
    console.log("No marketing webp files found.");
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  for (const file of files.sort()) {
    const result = await optimizeFile(path.join(marketingDir, file));
    totalBefore += result.before;
    totalAfter += result.after;
  }
  console.log(
    `Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
