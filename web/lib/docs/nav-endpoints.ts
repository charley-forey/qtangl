import { docsEndpoints } from "@/lib/docs/endpoints";
import { endpointDocsHref } from "@/lib/docs/endpoint-paths";
import type { DocsEndpoint } from "@/lib/docs/types";
import type { DocsNavItem } from "@/lib/docs/types";

function toNavItem(ep: DocsEndpoint): DocsNavItem {
  const item: DocsNavItem = { name: ep.title, href: endpointDocsHref(ep.id) };
  if (ep.status && ep.status !== "ga") {
    item.status = ep.status;
  }
  return item;
}

function endpointNavItemsByIds(ids: string[]): DocsNavItem[] {
  return ids
    .map((id) => docsEndpoints[id])
    .filter(Boolean)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(toNavItem);
}

function endpointNavItems(prefix: string): DocsNavItem[] {
  return Object.values(docsEndpoints)
    .filter((ep) => ep.id.startsWith(`${prefix}-`) || ep.id === prefix)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(toNavItem);
}

const TENANT_SCANS_IDS = [
  "tenant-scans",
  "tenant-scan-detail",
  "tenant-scan-delete",
  "tenant-scan-report",
  "tenant-scan-email",
  "tenant-remediation-list",
  "tenant-remediation-update",
  "tenant-remediation-automate",
  "tenant-remediation-verify",
  "tenant-remediation-intelligence",
  "tenant-remediation-simulate",
  "tenant-share-create",
  "tenant-passports",
  "tenant-share-revoke",
];

const TENANT_MONITOR_IDS = [
  "tenant-dashboard-summary",
  "tenant-dashboard-tab",
  "tenant-dashboard-events",
  "tenant-dashboard-recommendations",
  "tenant-dashboard-digest-preview",
  "tenant-dashboard-digest-send-test",
  "tenant-analytics-readiness-trend",
  "tenant-analytics-track",
  "tenant-scans-bulk-export",
  "tenant-scans-batch",
  "tenant-schedules-batch",
  "tenant-alerts-read",
  "tenant-alerts-read-all",
  "tenant-recommendations-dismiss",
  "tenant-schedules-list",
  "tenant-schedules-create",
  "tenant-schedules-patch",
  "tenant-schedules-runs",
  "tenant-schedules-delete",
  "tenant-webhooks-list",
  "tenant-webhooks-create",
  "tenant-webhooks-delete",
  "tenant-webhooks-dlq",
  "tenant-webhooks-replay",
  "tenant-audit",
  "tenant-audit-export",
  "tenant-export",
  "tenant-slo",
  "tenant-evidence-vault",
  "tenant-evidence-retain",
  "tenant-analytics-anomaly",
  "tenant-analytics-forecast",
  "tenant-benchmarks",
  "tenant-drift-intel",
];

const TENANT_INTEGRATIONS_IDS = [
  "tenant-integrations-list",
  "tenant-integrations-upsert",
  "tenant-integrations-push",
  "tenant-integrations-pull",
  "tenant-cloud-import",
  "tenant-integrations-cloud-list",
  "tenant-integrations-cloud-upsert",
  "tenant-integrations-cloud-test",
  "tenant-integrations-keyfactor",
  "tenant-integrations-keyfactor-test",
  "tenant-integrations-clm-upsert",
  "tenant-integrations-clm-test",
  "tenant-coverage-code-scan",
  "tenant-coverage-cloud",
];

const TENANT_ADMIN_IDS = [
  "tenant-me",
  "tenant-api-keys-list",
  "tenant-api-keys-create",
  "tenant-api-keys-delete",
  "tenant-members-list",
  "tenant-members-patch",
  "tenant-members-delete",
  "tenant-invites-list",
  "tenant-invites-create",
  "tenant-invites-delete",
  "tenant-sso-portal-link",
  "tenant-workspace-patch",
  "tenant-authorized-domains-list",
  "tenant-authorized-domains-create",
  "tenant-authorized-domains-patch",
  "tenant-onboarding-patch",
  "tenant-billing-checkout",
  "tenant-billing-portal-post",
  "tenant-billing-portal",
  "tenant-legal-accept",
  "tenant-settings-get",
  "tenant-settings-put",
  "tenant-oidc-get",
  "tenant-oidc-put",
  "tenant-compliance-posture",
  "tenant-data-delete",
  "tenant-offboard",
  "tenant-ai-explain",
  "tenant-ai-explain-scan",
  "tenant-ai-explain-portfolio",
];

const TENANT_PORTFOLIO_IDS = [
  "tenant-partner-portfolio-summary",
  "tenant-portfolio-list",
  "tenant-portfolio-add",
  "tenant-portfolio-command-center",
  "tenant-partner-children-list",
  "tenant-partner-children-link",
];

export const tenantScansNavItems = endpointNavItemsByIds(TENANT_SCANS_IDS);
export const tenantMonitorNavItems = endpointNavItemsByIds(TENANT_MONITOR_IDS);
export const tenantIntegrationsNavItems = endpointNavItemsByIds(TENANT_INTEGRATIONS_IDS);
export const tenantAdminNavItems = endpointNavItemsByIds(TENANT_ADMIN_IDS);
export const tenantPortfolioNavItems = endpointNavItemsByIds(TENANT_PORTFOLIO_IDS);

/** @deprecated Use grouped tenant nav exports instead. */
export const tenantNavItems: DocsNavItem[] = endpointNavItems("tenant");

export const pqcExtendedNavItems: DocsNavItem[] = [
  "pqc-scan-persist",
  "pqc-report-availability",
  "pqc-verify-get",
  "pqc-verify-post",
  "pqc-index",
  "pqc-index-drift",
  "pqc-transparency-consistency",
  "pqc-transparency-witnesses",
  "pqc-transparency-witness-submit",
  "pqc-transparency-root",
  "pqc-transparency-keys",
  "pqc-transparency-inclusion",
  "pqc-transparency-retire-key",
  "pqc-cbom-sources",
  "pqc-cbom-aggregate",
  "pqc-cbom-conflicts",
  "pqc-cbom-conflict-resolve",
  "pqc-cbom-diff",
  "pqc-cbom-cloud-pull",
  "pqc-scan-remediation-simulate",
]
  .map((id) => {
    const ep = docsEndpoints[id];
    if (!ep) return null;
    return toNavItem(ep);
  })
  .filter(Boolean) as DocsNavItem[];

export const adminNavItems: DocsNavItem[] = endpointNavItems("admin");
export const publicNavItems: DocsNavItem[] = endpointNavItems("public");
export const healthNavItems: DocsNavItem[] = [
  docsEndpoints.health,
  docsEndpoints["health-ready"],
  docsEndpoints.metrics,
]
  .filter(Boolean)
  .map((ep) => toNavItem(ep!));

export const sharingNavItems: DocsNavItem[] = endpointNavItems("sharing");
