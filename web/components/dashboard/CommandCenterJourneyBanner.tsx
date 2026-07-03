"use client";

import InsightCallout from "@/components/dashboard/ui/InsightCallout";
import Button from "@/components/ui/Button";
import { useJourneyStage } from "@/hooks/useJourneyStage";
import type { DashboardSummary } from "@/lib/dashboard-state";

export default function CommandCenterJourneyBanner({
  summary,
  tenantSettings,
  onOpenUpgrade,
  onTabChange,
}: {
  summary: DashboardSummary;
  tenantSettings?: Record<string, unknown> | null;
  onOpenUpgrade?: (product: "assess" | "monitor" | "convert") => void;
  onTabChange: (tab: string) => void;
}) {
  const journey = useJourneyStage(summary, tenantSettings);

  const action =
    journey.stage === "trial" && journey.hasBaseline && journey.trialRemaining <= 0 && !journey.assessPaid ? (
      <Button size="sm" onClick={() => onOpenUpgrade?.("assess")}>
        Upgrade Assess
      </Button>
    ) : journey.hasBaseline && !journey.canSchedule ? (
      <Button size="sm" onClick={() => onOpenUpgrade?.("monitor")}>
        Add Monitor
      </Button>
    ) : journey.hasBaseline ? (
      <Button size="sm" variant="secondary" onClick={() => onTabChange("monitor")}>
        Open Monitor
      </Button>
    ) : (
      <Button size="sm" variant="secondary" onClick={() => onTabChange("scans")}>
        Run baseline
      </Button>
    );

  return (
    <InsightCallout title={`Journey: ${journey.stage.replace("_", " ")}`} action={action}>
      {journey.nextBestAction}
    </InsightCallout>
  );
}
