#!/usr/bin/env node
/**
 * CI gate: ensure every backend route has a docsEndpoints entry (method + path).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

function loadEndpointSources() {
  const files = [
    join(repoRoot, "web", "lib", "docs", "endpoints.ts"),
    join(repoRoot, "web", "lib", "docs", "endpoints", "tenant.ts"),
    join(repoRoot, "web", "lib", "docs", "endpoints", "pqc-extended.ts"),
    join(repoRoot, "web", "lib", "docs", "endpoints", "admin-public-health.ts"),
    join(repoRoot, "web", "lib", "docs", "endpoints", "discovery.ts"),
    join(repoRoot, "web", "lib", "docs", "endpoints", "platform-extended.ts"),
  ];
  return files.map((f) => readFileSync(f, "utf8")).join("\n");
}

function normalizeRoute(method, path) {
  const normPath = path.replace(/\{[^}]+\}/g, "{param}");
  return `${method.toUpperCase()} ${normPath}`;
}

function documentedRoutes(source) {
  const routes = new Set();
  const blockRe = /method:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g;
  let m;
  while ((m = blockRe.exec(source)) !== null) {
    routes.add(normalizeRoute(m[1], m[2]));
  }
  const stubRe = /stub\(\s*"[^"]+"\s*,\s*"(GET|POST|PUT|PATCH|DELETE)"\s*,\s*"([^"]+)"/g;
  while ((m = stubRe.exec(source)) !== null) {
    routes.add(normalizeRoute(m[1], m[2]));
  }
  return routes;
}

function extractRoutesFromFile(filePath) {
  const src = readFileSync(filePath, "utf8");
  const prefixMatch = src.match(/APIRouter\(prefix="([^"]+)"/);
  const prefix = prefixMatch?.[1] ?? "";
  const routes = [];
  const routeRe = /@router\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g;
  let m;
  while ((m = routeRe.exec(src)) !== null) {
    routes.push(normalizeRoute(m[1], prefix + m[2]));
  }
  return routes;
}

function extractMainRoutes() {
  const src = readFileSync(join(repoRoot, "backend", "app", "main.py"), "utf8");
  const routes = [];
  const re = /@app\.(get|post)\(\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    routes.push(normalizeRoute(m[1], m[2]));
  }
  return routes;
}

const documented = documentedRoutes(loadEndpointSources());
const backendRoutes = [];

for (const file of readdirSync(join(repoRoot, "backend", "app", "api"))) {
  if (file.endsWith(".py")) {
    backendRoutes.push(...extractRoutesFromFile(join(repoRoot, "backend", "app", "api", file)));
  }
}
backendRoutes.push(...extractMainRoutes());

const undocumented = backendRoutes.filter((route) => !documented.has(route));

if (undocumented.length > 0) {
  console.error("Undocumented backend routes:");
  for (const r of [...new Set(undocumented)].sort()) {
    console.error(`  - ${r}`);
  }
  console.error(`\n${undocumented.length} route(s) missing from docs/endpoints*.ts`);
  process.exit(1);
}

console.log(`Docs coverage OK: ${backendRoutes.length} backend routes, ${documented.size} documented.`);
