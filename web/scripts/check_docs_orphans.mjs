#!/usr/bin/env node
/**
 * CI gate: static doc pages should appear in nav.ts, endpoint registry, or allowlist.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const docsApp = join(webRoot, "app", "docs");

/** Pages intentionally omitted from sidebar (Labs subtree, legacy URLs). */
const ORPHAN_ALLOWLIST = new Set([
  "/docs/reference/pqc/passport",
  "/docs/guides/routing",
  "/docs/guides/allocation",
  "/docs/guides/schedule",
  "/docs/guides/hospital-demo",
  "/docs/guides/airline-demo",
  "/docs/guides/ev-fleet-demo",
  "/docs/reference/hospital/roster",
  "/docs/reference/hospital/scenarios",
  "/docs/reference/hospital/callout",
  "/docs/reference/hospital/qpu-trace",
  "/docs/reference/hospital/upload-roster",
  "/docs/reference/hospital/callout-solve",
  "/docs/reference/airline/network",
  "/docs/reference/airline/scenarios",
  "/docs/reference/airline/disruption",
  "/docs/reference/airline/qpu-trace",
  "/docs/reference/airline/upload-crew",
  "/docs/reference/airline/recover-solve",
  "/docs/reference/ev-fleet/depot",
  "/docs/reference/ev-fleet/scenarios",
  "/docs/reference/ev-fleet/window",
  "/docs/reference/ev-fleet/qpu-trace",
  "/docs/reference/ev-fleet/upload-fleet",
  "/docs/reference/ev-fleet/upload-stops",
  "/docs/reference/ev-fleet/plan-solve",
]);

function endpointDocsHref(endpointId) {
  if (endpointId === "optimize") return "/docs/reference/optimize";
  if (endpointId === "health") return "/docs/reference/health";
  if (endpointId === "health-ready") return "/docs/reference/health/ready";
  if (endpointId === "metrics") return "/docs/reference/health/metrics";
  if (endpointId.startsWith("sharing-")) {
    return `/docs/reference/sharing/${endpointId.replace("sharing-", "")}`;
  }
  if (endpointId.startsWith("hospital-")) {
    return `/docs/reference/hospital/${endpointId.replace("hospital-", "")}`;
  }
  if (endpointId.startsWith("airline-")) {
    return `/docs/reference/airline/${endpointId.replace("airline-", "")}`;
  }
  if (endpointId.startsWith("ev-fleet-")) {
    return `/docs/reference/ev-fleet/${endpointId.replace("ev-fleet-", "")}`;
  }
  if (endpointId === "tenant-passport" || endpointId === "pqc-passport") {
    return "/docs/reference/pqc/passport";
  }
  if (endpointId === "pqc-cbom-ingest") {
    return "/docs/reference/pqc/cbom-import";
  }
  if (endpointId.startsWith("discovery-")) {
    return `/docs/reference/discovery/${endpointId.replace("discovery-", "")}`;
  }
  if (endpointId.startsWith("pqc-")) {
    return `/docs/reference/pqc/${endpointId.replace("pqc-", "")}`;
  }
  if (endpointId.startsWith("tenant-")) {
    return `/docs/reference/tenant/${endpointId.replace("tenant-", "")}`;
  }
  if (endpointId.startsWith("admin-")) {
    return `/docs/reference/admin/${endpointId.replace("admin-", "")}`;
  }
  if (endpointId.startsWith("public-")) {
    return `/docs/reference/public/${endpointId.replace("public-", "")}`;
  }
  return `/docs/reference/${endpointId}`;
}

function parseNavHrefs(navSource) {
  const hrefs = new Set();
  const re = /href:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(navSource)) !== null) {
    hrefs.add(m[1]);
  }
  return hrefs;
}

function parseEndpointIds(endpointsSource) {
  const ids = new Set();
  const defineRe = /defineEndpoint\(\s*"([^"]+)"/g;
  const objectRe = /"([a-zA-Z0-9_-]+)":\s*\{/g;
  let m;
  while ((m = defineRe.exec(endpointsSource)) !== null) {
    ids.add(m[1]);
  }
  while ((m = objectRe.exec(endpointsSource)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

function collectStaticPages(dir, base = "") {
  const pages = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry.startsWith("[") && entry.endsWith("]")) {
        continue;
      }
      pages.push(...collectStaticPages(full, `${base}/${entry}`));
      continue;
    }
    if (entry === "page.tsx") {
      pages.push(base ? `/docs${base}` : "/docs");
    }
  }
  return pages;
}

const navSource = readFileSync(join(webRoot, "lib", "docs", "nav.ts"), "utf8");
const endpointFiles = [
  "lib/docs/endpoints.ts",
  "lib/docs/endpoints/tenant.ts",
  "lib/docs/endpoints/pqc-extended.ts",
  "lib/docs/endpoints/admin-public-health.ts",
  "lib/docs/endpoints/discovery.ts",
  "lib/docs/endpoints/platform-extended.ts",
];
const endpointsSource = endpointFiles
  .map((rel) => readFileSync(join(webRoot, rel), "utf8"))
  .join("\n");

const knownHrefs = parseNavHrefs(navSource);
for (const id of parseEndpointIds(endpointsSource)) {
  knownHrefs.add(endpointDocsHref(id));
}

const staticPages = collectStaticPages(docsApp);
const orphans = staticPages.filter((href) => !knownHrefs.has(href) && !ORPHAN_ALLOWLIST.has(href));

if (orphans.length > 0) {
  console.error("Doc pages not in nav/endpoints and not allowlisted:");
  for (const href of orphans.sort()) {
    console.error(`  - ${href}`);
  }
  console.error(`\n${orphans.length} orphan page(s). Add to nav.ts or ORPHAN_ALLOWLIST in check_docs_orphans.mjs`);
  process.exit(1);
}

console.log(`Docs orphans OK: ${staticPages.length} static pages checked.`);
