"use client";

import { useCallback, useRef, useState } from "react";

import type { DashboardSummary, ScanProgressState } from "@/lib/dashboard-state";
import { patchSummaryScan } from "@/lib/dashboard-state";
import { fetchDashboardSummaryViaBff } from "@/lib/dashboard-transport";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgressState | null>(null);
  const loadedAtRef = useRef<number | null>(null);

  const loadSummary = useCallback(async () => {
    const started = performance.now();
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchDashboardSummaryViaBff();
      setSummary(payload);
      loadedAtRef.current = Date.now();
      trackDashboardEvent("dashboard_loaded", {
        mode: "bff",
        durationMs: Math.round(performance.now() - started),
      });
      trackDashboardEvent("dashboard_ttfv", {
        durationMs: Math.round(performance.now() - started),
      });
    } catch (loadError) {
      setSummary(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  const patchScan = useCallback(
    (event: {
      scanId: string;
      status: string;
      progressPct?: number;
      readinessScore?: number | null;
      readinessBand?: string | null;
      targetDomain?: string;
      updatedAt?: string;
    }) => {
      setScanProgress({
        scanId: event.scanId,
        status: event.status,
        progressPct: event.progressPct ?? (event.status === "done" ? 100 : 55),
        targetDomain: event.targetDomain,
        readinessScore: event.readinessScore,
        readinessBand: event.readinessBand,
      });
      setSummary((prev) => (prev ? patchSummaryScan(prev, event) : prev));
    },
    []
  );

  const patchKpis = useCallback((kpis: Partial<DashboardSummary["kpis"]>) => {
    setSummary((prev) => (prev ? { ...prev, kpis: { ...prev.kpis, ...kpis } } : prev));
  }, []);

  return {
    summary,
    loading,
    error,
    scanProgress,
    loadedAt: loadedAtRef.current,
    loadSummary,
    patchScan,
    patchKpis,
    setSummary,
  };
}
