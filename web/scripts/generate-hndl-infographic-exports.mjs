#!/usr/bin/env node
/**
 * Rasterize hndl-infographic.svg to PNG and wrap in a single-page PDF.
 * Run: npm run generate:hndl-exports
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "downloads", "hndl-infographic.svg");
const pngPath = join(root, "public", "downloads", "hndl-infographic.png");
const pdfPath = join(root, "public", "downloads", "hndl-infographic.pdf");

const svg = readFileSync(svgPath);
const pngBuffer = await sharp(svg, { density: 144 }).png().toBuffer();

writeFileSync(pngPath, pngBuffer);

const pdfDoc = await PDFDocument.create();
const pngImage = await pdfDoc.embedPng(pngBuffer);
const { width, height } = pngImage.scale(1);
const page = pdfDoc.addPage([width, height]);
page.drawImage(pngImage, { x: 0, y: 0, width, height });
writeFileSync(pdfPath, await pdfDoc.save());

console.log(`Wrote ${pngPath} and ${pdfPath}`);
