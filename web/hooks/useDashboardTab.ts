"use client";

import { useCallback, useRef, useState } from "react";

import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardTabBundle } from "@/lib/dashboard-state";
import { fetchTabBundle } from "@/lib/dashboard-transport";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

const TAB_ENDPOINTS: Record<Exclude<DashboardTabId, "overview">, string> = {
  scans: "scans",
  monitor: "monitor",
  remediate: "remediate",
  settings: "settings",
  portfolio: "portfolio",
};

export function useDashboardTab(activeTab: DashboardTabId) {
  const cacheRef = useRef<Partial<Record<DashboardTabId, DashboardTabBundle>>>({});
  const [bundle, setBundle] = useState<DashboardTabBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTab = useCallback(
    async (tab: DashboardTabId, force = false, opts?: { scanId?: string }) => {
      if (tab === "overview") {
        setBundle(null);
        return null;
      }
      const cacheKey = tab === "remediate" && opts?.scanId ? `${tab}:${opts.scanId}` : tab;
      const cached = cacheRef.current[cacheKey as DashboardTabId];
      if (cached && !force) {
        setBundle(cached);
        return cached;
      }
      const started = performance.now();
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTabBundle(
          TAB_ENDPOINTS[tab],
          tab === "remediate" && opts?.scanId ? { scanId: opts.scanId } : undefined
        );
        cacheRef.current[cacheKey as DashboardTabId] = data;
        setBundle(data);
        trackDashboardEvent("dashboard_tab_loaded", {
          tab,
          durationMs: Math.round(performance.now() - started),
        });
        return data;
      } catch (tabError) {
        setError(tabError instanceof Error ? tabError.message : "Failed to load tab.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const invalidateTab = useCallback((tab?: DashboardTabId) => {
    if (tab) {
      delete cacheRef.current[tab];
      return;
    }
    cacheRef.current = {};
  }, []);

  return { bundle, loading, error, loadTab, invalidateTab, activeTab };
}
