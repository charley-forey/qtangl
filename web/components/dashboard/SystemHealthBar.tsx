"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";
import { useMenuDismissal } from "@/hooks/useMenuDismissal";

import type { ScanProgressState } from "@/lib/dashboard-state";

type Signal = { label: string; tone: "success" | "warning" | "critical" | "neutral" };

const TONE_RANK: Record<Signal["tone"], number> = { critical: 3, warning: 2, neutral: 1, success: 0 };

export default function SystemHealthBar({
  schedulerEnabled,
  lastScanAt,
  scansThisMonth,
  quotaLimit,
  apiOk,
  scanProgress,
  eventsConnected,
  eventsDegraded,
}: {
  schedulerEnabled?: boolean;
  lastScanAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
  apiOk?: boolean;
  scanProgress?: ScanProgressState | null;
  eventsConnected?: boolean;
  eventsDegraded?: boolean;
}) {
  const ccV2 = useCommandCenterV2();
  const [opsHealth, setOpsHealth] = useState<{
    schedulerStale?: boolean;
    redis?: boolean;
    workerQueueEnabled?: boolean;
    scheduler?: { lastTickAt?: string };
  } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const closeDetail = useCallback(() => setDetailOpen(false), []);
  const detailRef = useMenuDismissal(detailOpen, closeDetail);

  useEffect(() => {
    if (!ccV2) return;
    void fetch("/api/dashboard/health")
      .then((r) => r.json())
      .then((body) => setOpsHealth(body))
      .catch(() => setOpsHealth({ schedulerStale: true }));
  }, [ccV2]);

  const quotaPct =
    quotaLimit && quotaLimit > 0 && scansThisMonth != null
      ? Math.round((scansThisMonth / quotaLimit) * 100)
      : null;

  const signals: Signal[] = [
    { label: schedulerEnabled ? "Scheduler on" : "Scheduler off", tone: schedulerEnabled ? "success" : "warning" },
    { label: apiOk !== false ? "API connected" : "API error", tone: apiOk !== false ? "success" : "critical" },
  ];
  if (eventsConnected != null) {
    signals.push({
      label: eventsConnected ? "Live events" : eventsDegraded ? "Events reconnecting" : "Events offline",
      tone: eventsConnected ? "success" : eventsDegraded ? "neutral" : "warning",
    });
  }
  if (quotaPct != null) {
    signals.push({ label: `Quota ${quotaPct}%`, tone: quotaPct >= 90 ? "warning" : "neutral" });
  }
  if (ccV2 && opsHealth) {
    signals.push({ label: opsHealth.redis ? "Redis up" : "Redis down", tone: opsHealth.redis ? "success" : "critical" });
    signals.push({
      label: opsHealth.workerQueueEnabled ? "Worker queue" : "Inline jobs",
      tone: opsHealth.workerQueueEnabled ? "success" : "warning",
    });
    if (opsHealth.schedulerStale) {
      signals.push({ label: "Scheduler degraded", tone: "critical" });
    } else if (opsHealth.scheduler?.lastTickAt) {
      signals.push({
        label: `Scheduler tick: ${new Date(opsHealth.scheduler.lastTickAt).toLocaleString()}`,
        tone: "neutral",
      });
    }
  }

  const worstTone = signals.reduce<Signal["tone"]>(
    (worst, s) => (TONE_RANK[s.tone] > TONE_RANK[worst] ? s.tone : worst),
    "success"
  );
  const summaryLabel =
    worstTone === "critical"
      ? "System issue detected"
      : worstTone === "warning"
        ? "System degraded"
        : "All systems normal";
  const summaryTone = worstTone === "neutral" ? "success" : worstTone;

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
          System
        </span>

        <div ref={detailRef} className="relative">
          <button
            type="button"
            onClick={() => setDetailOpen((o) => !o)}
            aria-expanded={detailOpen}
            aria-haspopup="true"
            className="inline-flex items-center gap-1.5"
          >
            <StatusPill label={summaryLabel} tone={summaryTone} />
          </button>
          {detailOpen ? (
            <div className="absolute left-0 top-full z-30 mt-2 min-w-[14rem] rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-2 shadow-lg">
              <div className="flex flex-wrap gap-1.5 p-1">
                {signals.map((s) => (
                  <StatusPill key={s.label} label={s.label} tone={s.tone} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {lastScanAt ? (
          <span className="text-[var(--color-gray-400)]">Last scan: {new Date(lastScanAt).toLocaleString()}</span>
        ) : (
          <span className="text-[var(--color-gray-400)]">No scans yet</span>
        )}
        {scanProgress && ["queued", "running"].includes(scanProgress.status) ? (
          <StatusPill label={`Scan ${scanProgress.progressPct}%`} tone="neutral" />
        ) : null}
      </div>
    </Card>
  );
}
