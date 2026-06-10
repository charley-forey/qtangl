#!/usr/bin/env node
/**
 * Generate minimal CycloneDX SBOM for Qtangl platform (backend + web lockfiles).
 * Run: node scripts/generate-platform-sbom.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const generatedAt = new Date().toISOString();

function parseRequirementsLock(path) {
  const lines = readFileSync(path, "utf8").split("\n");
  const components = [];
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z0-9_.-]+)==([^\s;]+)/);
    if (m) {
      components.push({
        type: "library",
        name: m[1],
        version: m[2],
        purl: `pkg:pypi/${m[1]}@${m[2]}`,
      });
    }
  }
  return components;
}

function parsePackageLock(path) {
  const lock = JSON.parse(readFileSync(path, "utf8"));
  const components = [];
  const packages = lock.packages || {};
  for (const [pkgPath, meta] of Object.entries(packages)) {
    if (!pkgPath || !meta.version) continue;
    const name = pkgPath.replace(/^node_modules\//, "") || "qtangl-web";
    components.push({
      type: "library",
      name,
      version: meta.version,
      purl: `pkg:npm/${name}@${meta.version}`,
    });
  }
  return components.slice(0, 200);
}

const backendComponents = parseRequirementsLock(join(root, "backend/requirements.lock"));
const webComponents = parsePackageLock(join(root, "web/package-lock.json"));

const sbom = {
  bomFormat: "CycloneDX",
  specVersion: "1.6",
  version: 1,
  metadata: {
    timestamp: generatedAt,
    component: {
      type: "application",
      name: "qtangl-platform",
      version: "0.1.0",
    },
    properties: [{ name: "qtangl:generator", value: "scripts/generate-platform-sbom.mjs" }],
  },
  components: [
    {
      type: "application",
      name: "qtangl-backend",
      version: "0.1.0",
      components: backendComponents,
    },
    {
      type: "application",
      name: "qtangl-web",
      version: "0.1.0",
      components: webComponents,
    },
  ],
};

const outPath = join(root, "web/public/downloads/qtangl-platform.cdx.json");
writeFileSync(outPath, JSON.stringify(sbom, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath} (${backendComponents.length} pip + ${webComponents.length} npm components)`);
