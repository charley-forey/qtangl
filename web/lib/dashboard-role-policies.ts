import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

export type RolePolicy = {
  tabs: string[];
  widgets: string[];
  exports: string[];
};

export const DEFAULT_ROLE_POLICIES: Record<string, RolePolicy> = {
  executive: {
    tabs: ["overview", "scans"],
    widgets: ["kpi", "trend", "digest", "compliance"],
    exports: ["pdf", "board"],
  },
  viewer: {
    tabs: ["overview", "scans"],
    widgets: ["kpi", "trend", "digest", "compliance"],
    exports: ["pdf", "board"],
  },
  operator: {
    tabs: ["overview", "scans", "monitor", "remediate"],
    widgets: ["kpi", "trend", "digest", "compliance", "insights", "forecast", "heatmap", "actions"],
    exports: ["pdf", "board", "bundle"],
  },
  admin: {
    tabs: ["*"],
    widgets: ["*"],
    exports: ["*"],
  },
  partner_admin: {
    tabs: ["*"],
    widgets: ["*"],
    exports: ["*"],
  },
  partner_analyst: {
    tabs: ["overview", "scans", "monitor", "remediate", "portfolio"],
    widgets: ["kpi", "trend", "digest", "compliance", "insights", "forecast", "heatmap", "actions"],
    exports: ["pdf", "board", "bundle"],
  },
  customer_executive: {
    tabs: ["overview", "scans"],
    widgets: ["kpi", "trend", "digest", "compliance"],
    exports: ["pdf", "board"],
  },
  customer_viewer: {
    tabs: ["overview", "scans"],
    widgets: ["kpi", "trend", "digest"],
    exports: ["pdf"],
  },
};

export function resolveRolePolicy(
  role: string | undefined,
  custom?: Record<string, RolePolicy> | null
): RolePolicy {
  const key = (role ?? "executive").toLowerCase();
  let normalized = key;
  if (key === "viewer") normalized = "executive";
  const merged = { ...DEFAULT_ROLE_POLICIES, ...(custom ?? {}) };
  return merged[normalized] ?? merged.executive ?? DEFAULT_ROLE_POLICIES.executive;
}

export function tabAllowed(policy: RolePolicy, tab: DashboardTabId): boolean {
  if (policy.tabs.includes("*")) return true;
  return policy.tabs.includes(tab);
}

export function widgetAllowed(policy: RolePolicy, widgetId: string): boolean {
  if (policy.widgets.includes("*")) return true;
  return policy.widgets.includes(widgetId);
}

export function exportAllowed(policy: RolePolicy, format: string): boolean {
  if (policy.exports.includes("*")) return true;
  return policy.exports.includes(format);
}
