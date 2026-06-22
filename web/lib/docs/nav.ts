import type { DocsNavSection } from "@/lib/docs/types";
import {
  adminNavItems,
  healthNavItems,
  pqcExtendedNavItems,
  publicNavItems,
  sharingNavItems,
  tenantAdminNavItems,
  tenantIntegrationsNavItems,
  tenantMonitorNavItems,
  tenantPortfolioNavItems,
  tenantScansNavItems,
} from "@/lib/docs/nav-endpoints";

export const docsSections: DocsNavSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/docs" },
      { name: "Quickstart", href: "/docs/quickstart" },
      { name: "Authentication & RBAC", href: "/docs/authentication" },
      { name: "SDKs, CLI & OpenAPI", href: "/docs/sdks" },
      { name: "API conventions", href: "/docs/operations/conventions" },
    ],
  },
  {
    id: "core-workflow",
    title: "Core Workflow",
    items: [
      { name: "PQC scanner guide", href: "/docs/guides/pqc-demo" },
      { name: "Assess workflow", href: "/docs/guides/assess" },
      { name: "Monitor workflow", href: "/docs/guides/monitor-workflow" },
      { name: "Convert workflow", href: "/docs/guides/convert" },
      { name: "Report formats & exports", href: "/docs/guides/report-formats" },
      { name: "Report branding", href: "/docs/guides/report-branding" },
      { name: "Executive digest", href: "/docs/guides/executive-digest" },
      { name: "Monitor setup", href: "/docs/guides/monitor-setup" },
      { name: "Dashboard SSO", href: "/docs/guides/sso-setup" },
      { name: "Dashboard team & roles", href: "/docs/guides/dashboard-team-roles" },
      { name: "Crypto flip guide", href: "/docs/guides/crypto-flip" },
      { name: "Drift monitoring", href: "/docs/guides/drift-monitoring" },
      { name: "KMS flip (AWS)", href: "/docs/guides/kms-flip-aws" },
      { name: "CLM flip (Venafi)", href: "/docs/guides/clm-flip-venafi" },
      { name: "Crypto flip API", href: "/docs/reference/crypto-flip-api" },
      { name: "Drift API", href: "/docs/reference/drift-api" },
      { name: "Concepts", href: "/docs/concepts" },
      { name: "Data formats", href: "/docs/data-formats" },
    ],
  },
  {
    id: "verify-trust",
    title: "Verify & Trust",
    items: [
      { name: "Verify specification", href: "/docs/verify-spec" },
      { name: "Verify concept", href: "/docs/guides/verify" },
      { name: "Transparency log", href: "/docs/guides/transparency" },
      { name: "CBOM aggregator", href: "/docs/guides/cbom" },
      { name: "Readiness Index", href: "/docs/guides/readiness-index" },
      { name: "Witness onboarding", href: "/docs/guides/transparency-witness" },
    ],
  },
  {
    id: "pqc-reference",
    title: "PQC API reference",
    items: [
      { name: "API guide", href: "/docs/api" },
      { name: "GET /pqc/inventory", href: "/docs/reference/pqc/inventory" },
      { name: "GET /pqc/scenarios", href: "/docs/reference/pqc/scenarios" },
      { name: "GET /pqc/target", href: "/docs/reference/pqc/target" },
      { name: "GET /pqc/handshake-trace", href: "/docs/reference/pqc/handshake-trace" },
      { name: "GET /pqc/standards", href: "/docs/reference/pqc/standards" },
      { name: "POST /pqc/upload-bundle", href: "/docs/reference/pqc/upload-bundle" },
      { name: "POST /pqc/scan", href: "/docs/reference/pqc/scan" },
      { name: "GET /pqc/scan/{scanId}", href: "/docs/reference/pqc/scan-status" },
      { name: "POST /pqc/handshake/prove", href: "/docs/reference/pqc/handshake-prove" },
      { name: "GET /pqc/report/{scanId}", href: "/docs/reference/pqc/report" },
      { name: "POST /pqc/cbom/ingest", href: "/docs/reference/pqc/cbom-import" },
      ...pqcExtendedNavItems,
    ],
  },
  {
    id: "tenant-scans",
    title: "Tenant API — Scans & reports",
    items: [{ name: "RBAC & scopes", href: "/docs/reference/rbac" }, ...tenantScansNavItems],
  },
  {
    id: "tenant-monitor",
    title: "Tenant API — Monitor & ops",
    items: tenantMonitorNavItems,
  },
  {
    id: "tenant-integrations",
    title: "Tenant API — Integrations",
    defaultCollapsed: true,
    items: tenantIntegrationsNavItems,
  },
  {
    id: "tenant-admin",
    title: "Tenant API — Admin & team",
    defaultCollapsed: true,
    items: tenantAdminNavItems,
  },
  {
    id: "tenant-portfolio",
    title: "Tenant API — Portfolio & MSSP",
    defaultCollapsed: true,
    items: tenantPortfolioNavItems,
  },
  {
    id: "discovery",
    title: "Discovery depth",
    defaultCollapsed: true,
    items: [
      { name: "Host sensor deploy", href: "/docs/guides/host-sensor-deploy" },
      { name: "Code scan CI", href: "/docs/guides/code-scan-ci" },
      { name: "POST /tenant/discovery/fleets", href: "/docs/reference/discovery/fleets-create" },
      { name: "GET /tenant/discovery/agents", href: "/docs/reference/discovery/agents" },
      { name: "POST /tenant/coverage/code-scan", href: "/docs/reference/discovery/code-scan" },
      { name: "POST /tenant/discovery/binary-scan", href: "/docs/reference/discovery/binary-scan" },
      { name: "GET /tenant/discovery/jobs/{job_id}", href: "/docs/reference/discovery/jobs" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    items: [
      { name: "Integrations overview", href: "/docs/integrations/overview" },
      { name: "Webhooks", href: "/docs/integrations/webhooks" },
      { name: "SIEM webhook v2", href: "/docs/integrations/siem-webhook-v2" },
      { name: "CI/CD integration", href: "/docs/integrations/ci-cd" },
      { name: "Cloud KMS import", href: "/docs/guides/cloud-import" },
      { name: "Portfolio & MSSP", href: "/docs/guides/portfolio-mssp" },
    ],
  },
  {
    id: "admin-public",
    title: "Admin & billing",
    items: [
      { name: "Admin & key lifecycle", href: "/docs/guides/admin-keys" },
      ...adminNavItems,
      { name: "Billing & onboarding", href: "/docs/guides/billing-onboarding" },
      ...publicNavItems,
      ...sharingNavItems,
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
      { name: "Tenancy & RLS", href: "/docs/guides/data-model" },
      { name: "Evidence vault", href: "/docs/guides/evidence-retention" },
      { name: "CORS", href: "/docs/operations/cors" },
      { name: "Versioning policy", href: "/docs/operations/versioning" },
      ...healthNavItems,
    ],
  },
  {
    id: "trust-compliance",
    title: "Trust & compliance",
    items: [
      { name: "Trust Center", href: "/trust" },
      { name: "Compliance status", href: "/docs/trust/compliance-status" },
      { name: "Compliance program", href: "/docs/trust/compliance-program" },
      { name: "Data residency", href: "/docs/trust/data-residency" },
      { name: "Incident response", href: "/docs/trust/incident-response" },
      { name: "Legal artifacts", href: "/docs/trust/legal" },
      { name: "Product SBOM", href: "/docs/trust/product-sbom" },
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
      { name: "Docs contribution", href: "/docs/resources/contribution" },
      { name: "Errors & status codes", href: "/docs/errors" },
      { name: "JSON schemas", href: "/docs/reference/schemas" },
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
