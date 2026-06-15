#!/usr/bin/env node
/**
 * Local/CI prebuild runs codegen + SDK builds.
 * Vercel uses committed artifacts and compiles SDKs in installCommand instead.
 */
import { spawnSync } from "node:child_process";

const isVercel = Boolean(process.env.VERCEL);

if (isVercel) {
  console.log("Skipping web prebuild codegen on Vercel (committed artifacts + installCommand SDK compile).");
}

const steps = isVercel
  ? []
  : [
      "npm run generate:library",
      "npm run generate:docs-index",
      "npm run generate:openapi",
      "npm run generate:docs-export",
      "npm run generate:pwa-icons",
      "npm run build:sdk",
      "npm run build:sdk-react",
    ];

for (const step of steps) {
  const result = spawnSync(step, { shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
