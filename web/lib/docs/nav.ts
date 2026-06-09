import type { DocsNavSection } from "@/lib/docs/types";
import {
  adminNavItems,
  healthNavItems,
  pqcExtendedNavItems,
  publicNavItems,
  sharingNavItems,
  tenantNavItems,
} from "@/lib/docs/nav-endpoints";

export const docsSections: DocsNavSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/docs" },
      { name: "Quickstart", href: "/docs/quickstart", status: "ga" },
      { name: "Authentication & RBAC", href: "/docs/authentication", status: "ga" },
      { name: "SDKs, CLI & OpenAPI", href: "/docs/sdks", status: "ga" },
      { name: "API conventions", href: "/docs/operations/conventions", status: "ga" },
    ],
  },
  {
    id: "core-workflow",
    title: "Core Workflow",
    items: [
      { name: "Assess workflow", href: "/docs/guides/assess", status: "ga" },
      { name: "Monitor workflow", href: "/docs/guides/monitor-workflow", status: "ga" },
      { name: "Convert workflow", href: "/docs/guides/convert", status: "pilot" },
      { name: "PQC scanner guide", href: "/docs/guides/pqc-demo", status: "pilot" },
      { name: "Monitor setup", href: "/docs/guides/monitor-setup", status: "ga" },
      { name: "Dashboard SSO", href: "/docs/guides/sso-setup", status: "pilot" },
      { name: "Concepts", href: "/docs/concepts" },
      { name: "Data formats", href: "/docs/data-formats" },
    ],
  },
  {
    id: "verify-trust",
    title: "Verify & Trust",
    items: [
      { name: "Verify specification", href: "/docs/verify-spec", status: "ga" },
      { name: "Verify concept", href: "/docs/guides/verify", status: "ga" },
      { name: "Transparency log", href: "/docs/guides/transparency", status: "pilot" },
      { name: "CBOM aggregator", href: "/docs/guides/cbom", status: "pilot" },
      { name: "Readiness Index", href: "/docs/guides/readiness-index", status: "pilot" },
      { name: "Witness onboarding", href: "/docs/guides/transparency-witness", status: "pilot" },
    ],
  },
  {
    id: "pqc-reference",
    title: "PQC API reference",
    items: [
      { name: "API guide", href: "/docs/api" },
      ...healthNavItems.filter((i) => i.href === "/docs/reference/health"),
      { name: "GET /pqc/inventory", href: "/docs/reference/pqc/inventory", status: "pilot" },
      { name: "GET /pqc/scenarios", href: "/docs/reference/pqc/scenarios", status: "pilot" },
      { name: "GET /pqc/target", href: "/docs/reference/pqc/target", status: "pilot" },
      { name: "GET /pqc/handshake-trace", href: "/docs/reference/pqc/handshake-trace", status: "pilot" },
      { name: "GET /pqc/standards", href: "/docs/reference/pqc/standards", status: "pilot" },
      { name: "POST /pqc/upload-bundle", href: "/docs/reference/pqc/upload-bundle", status: "pilot" },
      { name: "POST /pqc/scan", href: "/docs/reference/pqc/scan", status: "pilot" },
      { name: "GET /pqc/scan/{scanId}", href: "/docs/reference/pqc/scan-status", status: "pilot" },
      { name: "POST /pqc/handshake/prove", href: "/docs/reference/pqc/handshake-prove", status: "pilot" },
      { name: "GET /pqc/report/{scanId}", href: "/docs/reference/pqc/report", status: "pilot" },
      { name: "POST /tenant/scans/{scanId}/share", href: "/docs/reference/pqc/passport", status: "pilot" },
      { name: "POST /pqc/cbom/ingest", href: "/docs/reference/pqc/cbom-import", status: "pilot" },
      ...pqcExtendedNavItems,
    ],
  },
  {
    id: "tenant-reference",
    title: "Tenant API reference",
    items: [
      { name: "RBAC & scopes", href: "/docs/reference/rbac", status: "ga" },
      ...tenantNavItems,
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    items: [
      { name: "Integrations overview", href: "/docs/integrations/overview", status: "ga" },
      { name: "Webhooks", href: "/docs/integrations/webhooks", status: "ga" },
      { name: "SIEM webhook v2", href: "/docs/integrations/siem-webhook-v2", status: "ga" },
      { name: "CI/CD integration", href: "/docs/integrations/ci-cd", status: "ga" },
      { name: "Cloud KMS import", href: "/docs/guides/cloud-import", status: "pilot" },
      { name: "Portfolio & MSSP", href: "/docs/guides/portfolio-mssp", status: "pilot" },
    ],
  },
  {
    id: "admin-public",
    title: "Admin & billing",
    items: [
      { name: "Admin & key lifecycle", href: "/docs/guides/admin-keys", status: "pilot" },
      ...adminNavItems,
      { name: "Billing & onboarding", href: "/docs/guides/billing-onboarding", status: "ga" },
      ...publicNavItems,
      ...sharingNavItems,
      ...healthNavItems.filter((i) => i.href !== "/docs/reference/health"),
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
      { name: "Data retention & lifecycle", href: "/docs/operations/data-retention" },
      { name: "Tenancy & RLS", href: "/docs/guides/data-model", status: "pilot" },
      { name: "Evidence vault", href: "/docs/guides/evidence-retention", status: "pilot" },
      { name: "CORS", href: "/docs/operations/cors" },
      { name: "Versioning policy", href: "/docs/operations/versioning", status: "ga" },
    ],
  },
  {
    id: "trust-compliance",
    title: "Trust & compliance",
    items: [
      { name: "Trust Center", href: "/trust" },
      { name: "Compliance status", href: "/docs/trust/compliance-status", status: "ga" },
      { name: "Compliance program", href: "/docs/trust/compliance-program", status: "ga" },
      { name: "Data residency", href: "/docs/trust/data-residency", status: "ga" },
      { name: "Incident response", href: "/docs/trust/incident-response", status: "ga" },
      { name: "Legal artifacts", href: "/docs/trust/legal", status: "ga" },
      { name: "Product SBOM", href: "/docs/trust/product-sbom", status: "pilot" },
      { name: "Sub-processors", href: "/trust/subprocessors" },
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
      { name: "Support & SLA", href: "/docs/resources/support" },
      { name: "Docs contribution", href: "/docs/resources/contribution", status: "ga" },
      { name: "Errors & status codes", href: "/docs/errors" },
      { name: "JSON schemas", href: "/docs/reference/schemas" },
    ],
  },
  {
    id: "labs",
    title: "Labs / optimization (expansion)",
    items: [
      { name: "POST /optimize", href: "/docs/reference/optimize", status: "ga" },
      { name: "Routing guide", href: "/docs/guides/routing", status: "pilot" },
      { name: "Allocation guide", href: "/docs/guides/allocation", status: "pilot" },
      { name: "Schedule guide", href: "/docs/guides/schedule", status: "ga" },
      { name: "Hospital demo guide", href: "/docs/guides/hospital-demo", status: "pilot" },
      { name: "Airline demo guide", href: "/docs/guides/airline-demo", status: "pilot" },
      { name: "EV fleet demo guide", href: "/docs/guides/ev-fleet-demo", status: "pilot" },
      { name: "GET /hospital/roster", href: "/docs/reference/hospital/roster", status: "pilot" },
      { name: "GET /hospital/scenarios", href: "/docs/reference/hospital/scenarios", status: "pilot" },
      { name: "GET /hospital/callout", href: "/docs/reference/hospital/callout", status: "pilot" },
      { name: "GET /hospital/qpu-trace", href: "/docs/reference/hospital/qpu-trace", status: "pilot" },
      { name: "POST /hospital/upload-roster", href: "/docs/reference/hospital/upload-roster", status: "pilot" },
      { name: "POST /hospital/callout/solve", href: "/docs/reference/hospital/callout-solve", status: "pilot" },
      { name: "GET /airline/network", href: "/docs/reference/airline/network", status: "pilot" },
      { name: "GET /airline/scenarios", href: "/docs/reference/airline/scenarios", status: "pilot" },
      { name: "GET /airline/disruption", href: "/docs/reference/airline/disruption", status: "pilot" },
      { name: "GET /airline/qpu-trace", href: "/docs/reference/airline/qpu-trace", status: "pilot" },
      { name: "POST /airline/upload-crew", href: "/docs/reference/airline/upload-crew", status: "pilot" },
      { name: "POST /airline/recover/solve", href: "/docs/reference/airline/recover-solve", status: "pilot" },
      { name: "GET /ev-fleet/depot", href: "/docs/reference/ev-fleet/depot", status: "pilot" },
      { name: "GET /ev-fleet/scenarios", href: "/docs/reference/ev-fleet/scenarios", status: "pilot" },
      { name: "GET /ev-fleet/window", href: "/docs/reference/ev-fleet/window", status: "pilot" },
      { name: "GET /ev-fleet/qpu-trace", href: "/docs/reference/ev-fleet/qpu-trace", status: "pilot" },
      { name: "POST /ev-fleet/upload-fleet", href: "/docs/reference/ev-fleet/upload-fleet", status: "pilot" },
      { name: "POST /ev-fleet/upload-stops", href: "/docs/reference/ev-fleet/upload-stops", status: "pilot" },
      { name: "POST /ev-fleet/plan/solve", href: "/docs/reference/ev-fleet/plan-solve", status: "pilot" },
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
        crumbs.push({ name: section.title, href: section.items[0]?.href ?? "/docs" });
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
