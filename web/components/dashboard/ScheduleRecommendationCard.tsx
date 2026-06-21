"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { postDashboardJson } from "@/lib/dashboard-bff";
import { handleDashboardApiError } from "@/lib/dashboard-errors";

type Props = {
  scanAllowlist?: string[];
  dismissed?: boolean;
  onDismiss?: () => void;
  onMessage?: (message: string) => void;
  onRefresh?: () => void;
  onOpenUpgrade?: (product: "monitor") => void;
};

export default function ScheduleRecommendationCard({
  scanAllowlist = [],
  dismissed = false,
  onDismiss,
  onMessage,
  onRefresh,
  onOpenUpgrade,
}: Props) {
  const [creating, setCreating] = useState(false);
  const target = scanAllowlist[0];

  if (dismissed || !target) {
    return null;
  }

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
        onOpenUpgrade?.("monitor");
      }
      onMessage?.(handled.message);
    } finally {
      setCreating(false);
    }
  }

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
        Enable weekly re-scans on <strong className="text-white">{target}</strong> to catch crypto drift between
        audits.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={creating} onClick={() => void enableWeekly()}>
          {creating ? "Creating…" : "Enable weekly schedule"}
        </Button>
      </div>
    </Card>
  );
}
