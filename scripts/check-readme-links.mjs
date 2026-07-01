#!/usr/bin/env node
/**
 * Verify relative markdown links in README and docs/*.md resolve to existing files.
 * Skips http(s), mailto, and anchor-only links.
 * Run: node scripts/check-readme-links.mjs
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  join(root, "README.md"),
  join(root, "AGENTS.md"),
  join(root, "CONTRIBUTING.md"),
  join(root, "docs", "ARCHITECTURE.md"),
  join(root, "docs", "DEVELOPMENT.md"),
  join(root, "docs", "COMPLIANCE.md"),
  join(root, "docs", "GTM.md"),
  join(root, "backend", "README.md"),
  join(root, "web", "README.md"),
];

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

function isExternal(href) {
  return /^(https?:|mailto:|#)/i.test(href.trim());
}

function stripAnchor(href) {
  return href.split("#")[0];
}

function checkFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  const baseDir = dirname(filePath);
  const errors = [];

  for (const match of source.matchAll(LINK_RE)) {
    const href = match[2].trim();
    if (!href || isExternal(href)) continue;

    const pathPart = stripAnchor(href);
    if (!pathPart) continue;

    const target = normalize(resolve(baseDir, pathPart));
    const rootNorm = normalize(root);
    if (!target.startsWith(rootNorm)) {
      errors.push({ href, reason: "escapes repo root" });
      continue;
    }
    if (!existsSync(target)) {
      errors.push({ href, reason: "path not found" });
      continue;
    }
    try {
      statSync(target);
    } catch {
      errors.push({ href, reason: "not accessible" });
    }
  }

  return errors;
}

let failed = false;

for (const file of FILES) {
  if (!existsSync(file)) {
    console.error(`SKIP missing file: ${file}`);
    continue;
  }
  const rel = file.replace(root + "\\", "").replace(root + "/", "");
  const errors = checkFile(file);
  if (errors.length) {
    failed = true;
    console.error(`\n${rel}:`);
    for (const e of errors) {
      console.error(`  [${e.href}] — ${e.reason}`);
    }
  }
}

if (failed) {
  console.error("\nREADME/doc link check failed.");
  process.exit(1);
}

console.log(`Link check OK — ${FILES.filter((f) => existsSync(f)).length} files scanned`);
