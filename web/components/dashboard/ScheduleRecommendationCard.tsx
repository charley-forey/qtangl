"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { UpgradeContext } from "@/components/dashboard/UpgradeModal";
import { postDashboardJson } from "@/lib/dashboard-bff";
import { handleDashboardApiError } from "@/lib/dashboard-errors";

type Props = {
  scanAllowlist?: string[];
  tier?: string;
  maxSchedules?: number;
  readinessScore?: number | null;
  dismissed?: boolean;
  onDismiss?: () => void;
  onMessage?: (message: string) => void;
  onRefresh?: () => void;
  onOpenScans?: () => void;
  onOpenUpgrade?: (product: "monitor", context?: UpgradeContext) => void;
};

export default function ScheduleRecommendationCard({
  scanAllowlist = [],
  tier = "free",
  maxSchedules = 0,
  readinessScore,
  dismissed = false,
  onDismiss,
  onMessage,
  onRefresh,
  onOpenScans,
  onOpenUpgrade,
}: Props) {
  const [creating, setCreating] = useState(false);
  const target = scanAllowlist[0];
  const schedulesAllowed = maxSchedules > 0;

  if (dismissed || !target) {
    return null;
  }

  const upgradeContext: UpgradeContext = {
    source: "schedule_recommendation",
    domain: target,
    readinessScore,
  };

  async function enableWeekly() {
    setCreating(true);
    try {
      await postDashboardJson("/tenant/schedules", {
        scenarioId: "production-baseline",
        target,
        cadenceHours: 168,
        jobType: "scan",
      });
      onMessage?.("Weekly monitoring enabled.");
      onRefresh?.();
    } catch (error) {
      const handled = handleDashboardApiError(error);
      if (handled.upgradeProduct) {
        onOpenUpgrade?.("monitor", upgradeContext);
      }
      onMessage?.(handled.message);
    } finally {
      setCreating(false);
    }
  }

  function openMonitorUpgrade() {
    onOpenUpgrade?.("monitor", upgradeContext);
  }

  const readinessLine =
    readinessScore != null
      ? `Your baseline on ${target} scored ${readinessScore} — Monitor catches drift before your next audit.`
      : `Enable weekly re-scans on ${target} to catch crypto drift between audits.`;

  return (
    <Card tone="ghost" className="border border-amber-500/30 bg-amber-500/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Eyebrow>Recommended</Eyebrow>
        {onDismiss ? (
          <button
            type="button"
            className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)] hover:text-white"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-amber-100">
        {schedulesAllowed ? (
          <>
            Enable weekly re-scans on <strong className="text-white">{target}</strong> to catch crypto drift between
            audits.
          </>
        ) : (
          readinessLine
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {schedulesAllowed ? (
          <Button type="button" size="sm" disabled={creating} onClick={() => void enableWeekly()}>
            {creating ? "Creating…" : "Enable weekly schedule"}
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={openMonitorUpgrade}>
              See Monitor plans
            </Button>
            {onOpenScans ? (
              <Button type="button" size="sm" variant="secondary" onClick={onOpenScans}>
                Continue with manual scans
              </Button>
            ) : null}
          </>
        )}
      </div>
      {!schedulesAllowed && tier === "free" ? (
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Scheduled monitoring is included on Monitor — not on Assess (Free).
        </p>
      ) : null}
    </Card>
  );
}
