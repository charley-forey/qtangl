#!/usr/bin/env node
/**
 * @deprecated Use `python ../backend/scripts/export_openapi.py` (canonical FastAPI export).
 * Kept as a thin wrapper for backwards-compatible npm script names.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const result = spawnSync("python", [join(repoRoot, "backend", "scripts", "export_openapi.py")], {
  stdio: "inherit",
  cwd: repoRoot,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("OpenAPI artifact synced from FastAPI export.");
