/**
 * Build docs search index from nav.ts + endpoints.ts (single source of truth).
 * Parses TypeScript exports without a TS runtime.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

function parseNavSections(navSource) {
  const sections = [];
  const sectionRe =
    /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*items:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
  let match;
  while ((match = sectionRe.exec(navSource)) !== null) {
    const [, , title, itemsBlock] = match;
    const items = [];
    const itemRe = /\{\s*name:\s*"([^"]+)",\s*href:\s*"([^"]+)"/g;
    let itemMatch;
    while ((itemMatch = itemRe.exec(itemsBlock)) !== null) {
      items.push({ name: itemMatch[1], href: itemMatch[2] });
    }
    sections.push({ title, items });
  }
  return sections;
}

function parseEndpointSummaries(endpointsSource) {
  const entries = new Map();
  const blockRe = /"([a-zA-Z0-9_-]+)":\s*\{([\s\S]*?)\n  \},?\n/g;
  let match;
  while ((match = blockRe.exec(endpointsSource)) !== null) {
    const id = match[1];
    const block = match[2];
    const titleMatch = block.match(/title:\s*"([^"]+)"/);
    const summaryMatch = block.match(/summary:\s*\n?\s*"([^"]+)"/) ?? block.match(/summary:\s*"([^"]+)"/);
    const pathMatch = block.match(/path:\s*"([^"]+)"/);
    entries.set(id, {
      id,
      title: titleMatch?.[1] ?? id,
      summary: summaryMatch?.[1] ?? "",
      path: pathMatch?.[1] ?? "",
    });
  }
  return entries;
}

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
  if (endpointId.startsWith("pqc-")) {
    const slug = endpointId.replace("pqc-", "");
    const slugMap = {
      "scan-status": "scan-status",
      "handshake-prove": "handshake-prove",
      "cbom-cloud-pull": "cbom-cloud-pull",
    };
    return `/docs/reference/pqc/${slugMap[slug] ?? slug}`;
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

const pageDescriptions = {
  "/docs": "Qtangl PQC readiness platform — Assess, Monitor, Convert with signed evidence.",
  "/docs/quickstart": "Run your first PQC scan, download a signed report, and verify evidence.",
  "/docs/authentication": "API keys, RBAC roles, bearer tokens, and header schemes.",
  "/docs/sdks": "HTTP clients, qtangl-verify CLI, OpenAPI, and Postman collection.",
  "/docs/concepts": "Post-quantum readiness, Mosca HNDL, CBOM, and signed evidence.",
  "/docs/api": "API guide for PQC scan, tenant, and verify endpoints.",
  "/docs/errors": "HTTP status codes and error handling.",
  "/docs/verify-spec": "Independent verification of signed PQC assessment reports.",
  "/docs/trust/compliance-program": "SOC 2 kickoff, pen-test scope, and legal review checklists.",
};

const pageHeadings = {
  "/docs/errors": ["Error envelope", "HTTP status codes", "Retry guidance"],
  "/docs/authentication": ["RBAC roles", "Header schemes", "Key lifecycle"],
  "/docs/quickstart": ["Assess workflow", "Monitor next steps", "Verify evidence"],
  "/docs/api": ["PQC scan flow", "Tenant APIs", "Public verify"],
};

const navSource = readFileSync(join(webRoot, "lib", "docs", "nav.ts"), "utf8");
const endpointFiles = [
  "lib/docs/endpoints.ts",
  "lib/docs/endpoints/tenant.ts",
  "lib/docs/endpoints/pqc-extended.ts",
  "lib/docs/endpoints/admin-public-health.ts",
];
const endpointsSource = endpointFiles
  .map((rel) => readFileSync(join(webRoot, rel), "utf8"))
  .join("\n");

const sections = parseNavSections(navSource);
const endpointMeta = parseEndpointSummaries(endpointsSource);

const merged = new Map();

for (const section of sections) {
  for (const item of section.items) {
    merged.set(item.href, {
      href: item.href,
      title: item.name,
      section: section.title,
      description: pageDescriptions[item.href] ?? "",
      headings: pageHeadings[item.href] ?? [],
    });
  }
}

for (const [id, meta] of endpointMeta) {
  const href = endpointDocsHref(id);
  if (!merged.has(href)) {
    merged.set(href, {
      href,
      title: meta.title,
      section: "API Reference",
      description: meta.summary,
      headings: [],
    });
  } else {
    const existing = merged.get(href);
    if (!existing.description && meta.summary) {
      existing.description = meta.summary;
    }
  }
}

const index = Array.from(merged.values()).sort((a, b) => a.href.localeCompare(b.href));
const outPath = join(webRoot, "public", "docs-search-index.json");
writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(`Wrote ${index.length} entries to ${outPath}`);
