import { docsEndpoints } from "@/lib/docs/endpoints";
import { endpointDocsHref } from "@/lib/docs/endpoint-paths";
import type { DocsNavItem } from "@/lib/docs/types";

function endpointNavItems(prefix: string, labelFn?: (endpoint: (typeof docsEndpoints)[string]) => string): DocsNavItem[] {
  return Object.values(docsEndpoints)
    .filter((ep) => ep.id.startsWith(`${prefix}-`) || ep.id === prefix)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((ep) => ({
      name: labelFn?.(ep) ?? ep.title,
      href: endpointDocsHref(ep.id),
      status: ep.status,
    }));
}

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
]
  .map((id) => {
    const ep = docsEndpoints[id];
    if (!ep) return null;
    return { name: ep.title, href: endpointDocsHref(id), status: ep.status };
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
  .map((ep) => ({
    name: ep!.title,
    href: endpointDocsHref(ep!.id),
    status: ep!.status,
  }));

export const sharingNavItems: DocsNavItem[] = endpointNavItems("sharing");
