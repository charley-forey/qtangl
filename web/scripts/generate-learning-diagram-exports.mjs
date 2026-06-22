#!/usr/bin/env node
/**
 * Ensure learning diagram PNG placeholders exist for blog cover images.
 * Run: node scripts/generate-learning-diagram-exports.mjs
 *
 * When diagram PNGs are added under public/learn/diagrams/, this script
 * verifies they exist. Falls back to copying qtangl SVG covers if missing.
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const diagramDir = join(root, "public", "learn", "diagrams");
const topicsDir = join(root, "public", "learn", "topics");
mkdirSync(diagramDir, { recursive: true });
mkdirSync(topicsDir, { recursive: true });

const diagrams = [
  "threat-map",
  "hndl-timeline",
  "mosca-gauge",
  "nist-algorithm-tree",
  "hybrid-tls-handshake",
  "migration-stack",
  "qkd-vs-pqc",
  "crypto-attack-surface",
];

const fallbackSvg = join(root, "public", "qtangl-pqc-hndl-cover.svg");

for (const id of diagrams) {
  const pngPath = join(diagramDir, `${id}.png`);
  if (!existsSync(pngPath) && existsSync(fallbackSvg)) {
    copyFileSync(fallbackSvg, pngPath);
    console.log(`Placeholder: ${pngPath} (from SVG fallback)`);
  } else if (existsSync(pngPath)) {
    console.log(`OK: ${pngPath}`);
  }
}

const foundationsHero = join(topicsDir, "quantum-crypto-foundations.png");
if (!existsSync(foundationsHero) && existsSync(fallbackSvg)) {
  copyFileSync(fallbackSvg, foundationsHero);
  console.log(`Placeholder: ${foundationsHero}`);
}

console.log("Learning diagram export check complete.");
