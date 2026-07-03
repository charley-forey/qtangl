"use client";

import type { DashboardSummary } from "@/lib/dashboard-state";

export type JourneyStage = "trial" | "paid_assess" | "monitor" | "convert" | "enterprise";

export type JourneyState = {
  stage: JourneyStage;
  hasBaseline: boolean;
  canSchedule: boolean;
  canRemediateProgram: boolean;
  nextBestAction: string;
  trialRemaining: number;
  assessPaid: boolean;
};

export function useJourneyStage(
  summary: DashboardSummary | null,
  tenantSettings?: Record<string, unknown> | null
): JourneyState {
  const tier = String((summary?.me?.entitlements as { tier?: string })?.tier ?? "free");
  const billing = (tenantSettings?.billing ?? {}) as {
    assessPaidAt?: string | null;
    trialScansUsed?: number;
    trialScansRemaining?: number;
  };
  const entitlements = summary?.me?.entitlements as {
    maxSchedules?: number;
    trialScansRemaining?: number;
  };
  const hasBaseline = (summary?.recentScans?.length ?? 0) > 0;
  const trialRemaining =
    billing.trialScansRemaining ?? entitlements?.trialScansRemaining ?? 0;
  const assessPaid = Boolean(billing.assessPaidAt);
  const canSchedule = (entitlements?.maxSchedules ?? 0) > 0;

  let stage: JourneyStage = "trial";
  if (tier === "enterprise") stage = "enterprise";
  else if (tier === "convert") stage = "convert";
  else if (tier === "monitor") stage = "monitor";
  else if (assessPaid) stage = "paid_assess";

  let nextBestAction = "Run your first baseline scan";
  if (hasBaseline && stage === "trial" && trialRemaining <= 0 && !assessPaid) {
    nextBestAction = "Upgrade to Assess for ongoing scans";
  } else if (hasBaseline && (stage === "trial" || stage === "paid_assess") && !canSchedule) {
    nextBestAction = "Schedule monitoring to track drift";
  } else if (hasBaseline && canSchedule && stage !== "convert" && stage !== "enterprise") {
    nextBestAction = "Review drift alerts and remediate priorities";
  } else if (hasBaseline) {
    nextBestAction = "Verify fixes and export signed evidence";
  }

  return {
    stage,
    hasBaseline,
    canSchedule,
    canRemediateProgram: stage === "convert" || stage === "enterprise",
    nextBestAction,
    trialRemaining,
    assessPaid,
  };
}
