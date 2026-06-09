#!/usr/bin/env node
/** Sync-check backend JSON Schema contracts against web/lib/docs/contracts/. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const backendContracts = join(repoRoot, "backend", "contracts");
const webContracts = join(repoRoot, "web", "lib", "docs", "contracts");

if (!existsSync(backendContracts)) {
  console.log("No backend/contracts directory — skipping schema sync check.");
  process.exit(0);
}

const backendFiles = readdirSync(backendContracts).filter((f) => f.endsWith(".schema.json"));
const missing = [];
const drift = [];

for (const file of backendFiles) {
  const webPath = join(webContracts, file);
  if (!existsSync(webPath)) {
    missing.push(file);
    continue;
  }
  const backendJson = readFileSync(join(backendContracts, file), "utf8");
  const webJson = readFileSync(webPath, "utf8");
  if (backendJson.trim() !== webJson.trim()) {
    drift.push(file);
  }
}

if (missing.length || drift.length) {
  if (missing.length) {
    console.error("Missing in web/lib/docs/contracts:", missing.join(", "));
  }
  if (drift.length) {
    console.error("Drift vs backend/contracts:", drift.join(", "));
  }
  process.exit(1);
}

console.log(`Schema sync OK: ${backendFiles.length} contract file(s).`);
