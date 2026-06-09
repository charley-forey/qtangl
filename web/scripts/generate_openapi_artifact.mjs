#!/usr/bin/env node
/** Generate OpenAPI 3.1 artifact from docs endpoint definitions for static hosting. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const sources = [
  join(webRoot, "lib", "docs", "endpoints.ts"),
  join(webRoot, "lib", "docs", "endpoints", "tenant.ts"),
  join(webRoot, "lib", "docs", "endpoints", "pqc-extended.ts"),
  join(webRoot, "lib", "docs", "endpoints", "admin-public-health.ts"),
];

const paths = {};
for (const file of sources) {
  const src = readFileSync(file, "utf8");
  const blockRe = /path:\s*"([^"]+)"[\s\S]*?method:\s*"([^"]+)"[\s\S]*?summary:\s*\n?\s*"([^"]+)"/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const [, path, method, summary] = m;
    if (!paths[path]) paths[path] = {};
    paths[path][method.toLowerCase()] = {
      summary,
      responses: { "200": { description: "Success" }, "401": { description: "Unauthorized" } },
    };
  }
}

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Qtangl PQC Readiness API",
    version: "0.9.0",
    description: "Post-quantum readiness platform: Assess, Monitor, Convert with signed evidence.",
  },
  servers: [{ url: "https://api.qtangl.com" }],
  paths,
};

mkdirSync(join(webRoot, "public"), { recursive: true });
writeFileSync(join(webRoot, "public", "openapi.json"), `${JSON.stringify(openapi, null, 2)}\n`);

const postman = {
  info: { name: "Qtangl API", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  item: Object.entries(paths).flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, op]) => ({
      name: `${method.toUpperCase()} ${path}`,
      request: {
        method: method.toUpperCase(),
        header: [{ key: "Authorization", value: "Bearer {{QTANGL_API_KEY}}" }],
        url: `{{baseUrl}}${path.replace(/\{[^}]+\}/g, "example")}`,
        description: op.summary,
      },
    })),
  ),
  variable: [
    { key: "baseUrl", value: "https://api.qtangl.com" },
    { key: "QTANGL_API_KEY", value: "your-api-key" },
  ],
};

mkdirSync(join(webRoot, "public", "postman"), { recursive: true });
writeFileSync(join(webRoot, "public", "postman", "qtangl-api.json"), `${JSON.stringify(postman, null, 2)}\n`);
console.log(`Wrote openapi.json (${Object.keys(paths).length} paths) and Postman collection.`);
