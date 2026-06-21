#!/usr/bin/env node
/**
 * CI gate: fail if status: "pilot" appears in nav or endpoint registries.
 * Roadmap data (roadmap.ts) may still use pilot for product planning display.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const docsLib = join(repoRoot, "web", "lib", "docs");

const FILES = [
  join(docsLib, "nav.ts"),
  join(docsLib, "endpoints.ts"),
  ...readdirSync(join(docsLib, "endpoints"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(docsLib, "endpoints", f)),
];

const violations = [];
for (const file of FILES) {
  const src = readFileSync(file, "utf8");
  if (/status:\s*"pilot"/.test(src)) {
    const count = (src.match(/status:\s*"pilot"/g) ?? []).length;
    violations.push({ file, count });
  }
}

if (violations.length > 0) {
  console.error('Found status: "pilot" in docs registries (retired — use ga or omit):');
  for (const v of violations) {
    console.error(`  - ${v.file.replace(repoRoot + "\\", "").replace(repoRoot + "/", "")} (${v.count})`);
  }
  process.exit(1);
}

console.log("Docs status OK: no pilot tags in nav or endpoint registries.");
