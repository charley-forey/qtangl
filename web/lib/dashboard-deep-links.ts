import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

const VALID_TABS = new Set<DashboardTabId>([
  "overview",
  "scans",
  "monitor",
  "remediate",
  "settings",
  "portfolio",
]);

export type ParsedDeepLink = {
  tab: DashboardTabId | null;
  scanId: string | null;
  remediationId: string | null;
  action: string | null;
};

export function normalizeDashboardTab(value: string | null | undefined): DashboardTabId | null {
  if (!value) return null;
  const normalized = value.toLowerCase() as DashboardTabId;
  return VALID_TABS.has(normalized) ? normalized : null;
}

export function buildDashboardDeepLink(opts: {
  tab: DashboardTabId;
  scanId?: string | null;
  remediationId?: string | null;
  action?: string | null;
}): string {
  const params = new URLSearchParams();
  params.set("tab", opts.tab);
  if (opts.scanId) params.set("scanId", opts.scanId);
  if (opts.remediationId) params.set("remediationId", opts.remediationId);
  if (opts.action) params.set("action", opts.action);
  return `/dashboard?${params.toString()}`;
}

export function parseDashboardDeepLink(searchParams: URLSearchParams): ParsedDeepLink {
  return {
    tab: normalizeDashboardTab(searchParams.get("tab")),
    scanId: searchParams.get("scanId"),
    remediationId: searchParams.get("remediationId"),
    action: searchParams.get("action"),
  };
}

export function resolveDashboardTabFromDeepLink(parsed: ParsedDeepLink): DashboardTabId | null {
  if (parsed.tab) return parsed.tab;
  if (parsed.remediationId) return "remediate";
  if (parsed.scanId) return "scans";
  return null;
}

export function navigateDashboardDeepLink(
  url: string,
  router: { push: (href: string) => void },
  onTabChange?: (tab: DashboardTabId) => void
) {
  if (!url) return;
  if (url.startsWith("/dashboard")) {
    router.push(url);
    try {
      const parsed = parseDashboardDeepLink(new URL(url, window.location.origin).searchParams);
      const tab = resolveDashboardTabFromDeepLink(parsed);
      if (tab) onTabChange?.(tab);
    } catch {
      /* optional */
    }
    return;
  }
  if (url.startsWith("?")) {
    router.push(`/dashboard${url}`);
    return;
  }
  router.push(url);
}
