#!/usr/bin/env node
/**
 * Validates readiness blog registry entries have hubLink + ctaPrimary in frontmatter.
 * Run: node scripts/check-readiness-content-links.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = join(root, "web", "lib", "copy", "readiness-content-registry.ts");
const contentRoot = join(root, "web", "content", "readiness");

const registrySource = readFileSync(registryPath, "utf-8");
const markdownFileMatches = [...registrySource.matchAll(/markdownFile:\s*"([^"]+)"/g)];
const files = markdownFileMatches.map((m) => m[1]);

let failed = false;

for (const file of files) {
  const fullPath = join(contentRoot, file);
  if (!existsSync(fullPath)) {
    console.error(`MISSING: ${file}`);
    failed = true;
    continue;
  }
  const raw = readFileSync(fullPath, "utf-8");
  for (const field of ["hubLink", "ctaPrimary", "sourceIds", "title", "description"]) {
    if (!raw.includes(`${field}:`)) {
      console.error(`${file}: missing frontmatter field ${field}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`OK: ${files.length} readiness markdown files validated.`);
