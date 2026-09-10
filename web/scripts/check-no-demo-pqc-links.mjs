#!/usr/bin/env node
/**
 * CI guard: fail if new internal links point at legacy /demo/pqc (redirect-only path).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const needle = "/demo/pqc";

const allowPaths = new Set([
  "next.config.ts",
  "app/demo/pqc/page.tsx",
  "app/demo/pqc/methodology/page.tsx",
  "app/demo/pqc/opengraph-image.tsx",
  "scripts/check-no-demo-pqc-links.mjs",
  "tests/e2e/assess.spec.ts",
]);

const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".json"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(webRoot)) {
  const rel = path.relative(webRoot, file).replaceAll("\\", "/");
  if (allowPaths.has(rel)) continue;
  // Redirect sources preserve old URLs; destinations and links must use current routes.
  const text = fs.readFileSync(file, "utf8").replace(/\bsource:\s*"\/demo\/pqc(?:\/[^"\n]*)?"/g, "");
  if (!text.includes(needle)) continue;
  violations.push(rel);
}

if (violations.length > 0) {
  console.error(`Found ${violations.length} file(s) with legacy ${needle} references:`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log(`OK: no internal ${needle} links under web/`);
