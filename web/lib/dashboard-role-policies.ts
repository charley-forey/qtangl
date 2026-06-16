import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

export type RolePolicy = {
  tabs: string[];
  widgets: string[];
  exports: string[];
};

export const DEFAULT_ROLE_POLICIES: Record<string, RolePolicy> = {
  viewer: {
    tabs: ["overview", "scans"],
    widgets: ["kpi", "trend", "digest", "compliance"],
    exports: ["pdf"],
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
};

export function resolveRolePolicy(
  role: string | undefined,
  custom?: Record<string, RolePolicy> | null
): RolePolicy {
  const key = (role ?? "viewer").toLowerCase();
  const merged = { ...DEFAULT_ROLE_POLICIES, ...(custom ?? {}) };
  return merged[key] ?? merged.viewer ?? DEFAULT_ROLE_POLICIES.viewer;
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
