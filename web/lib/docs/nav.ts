import type { DocsNavSection } from "@/lib/docs/types";

export const docsSections: DocsNavSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/docs" },
      { name: "Quickstart", href: "/docs/quickstart" },
      { name: "Authentication", href: "/docs/authentication" },
      {
        name: "SDKs & integrations",
        href: "/docs/sdks",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "guides",
    title: "Guides",
    items: [
      { name: "Concepts", href: "/docs/concepts" },
      { name: "Data formats", href: "/docs/data-formats" },
      { name: "Schedule guide", href: "/docs/guides/schedule", status: "ga" },
      {
        name: "Routing guide",
        href: "/docs/guides/routing",
        status: "pilot",
      },
      {
        name: "Allocation guide",
        href: "/docs/guides/allocation",
        status: "pilot",
      },
      {
        name: "Hospital demo guide",
        href: "/docs/guides/hospital-demo",
        status: "pilot",
      },
      {
        name: "Airline demo guide",
        href: "/docs/guides/airline-demo",
        status: "pilot",
      },
    ],
  },
  {
    id: "reference",
    title: "API Reference",
    items: [
      { name: "API guide", href: "/docs/api" },
      { name: "POST /optimize", href: "/docs/reference/optimize", status: "ga" },
      { name: "GET /health", href: "/docs/reference/health", status: "ga" },
      {
        name: "GET /hospital/roster",
        href: "/docs/reference/hospital/roster",
        status: "pilot",
      },
      {
        name: "GET /hospital/scenarios",
        href: "/docs/reference/hospital/scenarios",
        status: "pilot",
      },
      {
        name: "GET /hospital/callout",
        href: "/docs/reference/hospital/callout",
        status: "pilot",
      },
      {
        name: "GET /hospital/qpu-trace",
        href: "/docs/reference/hospital/qpu-trace",
        status: "pilot",
      },
      {
        name: "POST /hospital/upload-roster",
        href: "/docs/reference/hospital/upload-roster",
        status: "pilot",
      },
      {
        name: "POST /hospital/callout/solve",
        href: "/docs/reference/hospital/callout-solve",
        status: "pilot",
      },
      {
        name: "GET /airline/network",
        href: "/docs/reference/airline/network",
        status: "pilot",
      },
      {
        name: "GET /airline/scenarios",
        href: "/docs/reference/airline/scenarios",
        status: "pilot",
      },
      {
        name: "GET /airline/disruption",
        href: "/docs/reference/airline/disruption",
        status: "pilot",
      },
      {
        name: "GET /airline/qpu-trace",
        href: "/docs/reference/airline/qpu-trace",
        status: "pilot",
      },
      {
        name: "POST /airline/upload-crew",
        href: "/docs/reference/airline/upload-crew",
        status: "pilot",
      },
      {
        name: "POST /airline/recover/solve",
        href: "/docs/reference/airline/recover-solve",
        status: "pilot",
      },
      { name: "Errors & status codes", href: "/docs/errors" },
      { name: "JSON schemas", href: "/docs/reference/schemas" },
    ],
  },
  {
    id: "operations",
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
    id: "resources",
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

/** Flat nav order for prev/next pager and search index. */
export function flattenDocsNav(): { name: string; href: string }[] {
  return docsSections.flatMap((section) => section.items);
}

export function getDocsPager(href: string): {
  prev: { name: string; href: string } | null;
  next: { name: string; href: string } | null;
} {
  const flat = flattenDocsNav();
  const index = flat.findIndex((item) => item.href === href);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? flat[index - 1]! : null,
    next: index < flat.length - 1 ? flat[index + 1]! : null,
  };
}

export function getBreadcrumbs(href: string): { name: string; href: string }[] {
  const crumbs: { name: string; href: string }[] = [
    { name: "Docs", href: "/docs" },
  ];

  for (const section of docsSections) {
    const item = section.items.find((entry) => entry.href === href);
    if (item) {
      if (href !== "/docs") {
        crumbs.push({ name: item.name, href: item.href });
      }
      return crumbs;
    }
  }

  if (href !== "/docs") {
    crumbs.push({ name: "Page", href });
  }
  return crumbs;
}

export function getAllDocsHrefs(): string[] {
  return flattenDocsNav().map((item) => item.href);
}

/** Legacy export for any remaining imports */
export const docsNav = flattenDocsNav();
