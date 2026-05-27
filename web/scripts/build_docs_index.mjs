import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

const docsSections = [
  {
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/docs" },
      { name: "Quickstart", href: "/docs/quickstart" },
      { name: "Authentication", href: "/docs/authentication" },
      { name: "SDKs & integrations", href: "/docs/sdks" },
    ],
  },
  {
    title: "Guides",
    items: [
      { name: "Concepts", href: "/docs/concepts" },
      { name: "Data formats", href: "/docs/data-formats" },
      { name: "Schedule guide", href: "/docs/guides/schedule" },
      { name: "Routing guide", href: "/docs/guides/routing" },
      { name: "Allocation guide", href: "/docs/guides/allocation" },
      { name: "Hospital demo guide", href: "/docs/guides/hospital-demo" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { name: "API guide", href: "/docs/api" },
      { name: "POST /optimize", href: "/docs/reference/optimize" },
      { name: "GET /health", href: "/docs/reference/health" },
      { name: "GET /hospital/roster", href: "/docs/reference/hospital/roster" },
      { name: "GET /hospital/scenarios", href: "/docs/reference/hospital/scenarios" },
      { name: "GET /hospital/callout", href: "/docs/reference/hospital/callout" },
      { name: "GET /hospital/qpu-trace", href: "/docs/reference/hospital/qpu-trace" },
      {
        name: "POST /hospital/upload-roster",
        href: "/docs/reference/hospital/upload-roster",
      },
      {
        name: "POST /hospital/callout/solve",
        href: "/docs/reference/hospital/callout-solve",
      },
      { name: "Errors & status codes", href: "/docs/errors" },
      { name: "JSON schemas", href: "/docs/reference/schemas" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Rate limits", href: "/docs/operations/rate-limits" },
      { name: "Environments", href: "/docs/operations/environments" },
      { name: "Observability", href: "/docs/operations/observability" },
      { name: "Security", href: "/docs/operations/security" },
      { name: "Data retention", href: "/docs/operations/data-retention" },
      { name: "CORS", href: "/docs/operations/cors" },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Glossary", href: "/docs/resources/glossary" },
      { name: "FAQ", href: "/docs/resources/faq" },
      { name: "Changelog", href: "/docs/resources/changelog" },
      { name: "Roadmap", href: "/docs/resources/roadmap" },
      { name: "Support", href: "/docs/resources/support" },
    ],
  },
];

const pageDescriptions = {
  "/docs": "Qtangl planning API overview and documentation map.",
  "/docs/quickstart": "Send your first schedule optimization request in minutes.",
  "/docs/authentication": "API keys, bearer tokens, and header schemes.",
  "/docs/sdks": "HTTP client recipes and upcoming official SDKs.",
  "/docs/concepts": "Scheduling, routing, allocation, and hybrid execution.",
  "/docs/data-formats": "Fields for schedules, routes, and staffing payloads.",
  "/docs/api": "API guide for POST /optimize and related endpoints.",
  "/docs/errors": "HTTP status codes and error handling.",
};

const index = [];

for (const section of docsSections) {
  for (const item of section.items) {
    index.push({
      href: item.href,
      title: item.name,
      section: section.title,
      description: pageDescriptions[item.href] ?? "",
      headings: [],
    });
  }
}

const outPath = join(webRoot, "public", "docs-search-index.json");
writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(`Wrote ${index.length} entries to ${outPath}`);
