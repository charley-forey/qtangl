"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { DashboardSummary } from "@/lib/dashboard-state";

type Props = {
  summary: DashboardSummary;
  tenantSettings: Record<string, unknown> | null;
  checkoutSuccess?: string | null;
  onTabChange: (tab: string) => void;
  onOpenUpgrade?: (product: "assess" | "monitor") => void;
  onDismiss: (bannerId: string) => void;
};

export default function CoachingBanner({
  summary,
  tenantSettings,
  checkoutSuccess,
  onTabChange,
  onOpenUpgrade,
  onDismiss,
}: Props) {
  const dismissed = new Set((tenantSettings?.coaching as { bannersDismissed?: string[] } | undefined)?.bannersDismissed ?? []);
  const milestones = summary.coaching?.milestones ?? {};
  const billing = (tenantSettings?.billing as { trialScansUsed?: number; assessPaidAt?: string | null }) ?? {};
  const hasScans = Boolean(milestones.firstScanAt) || summary.recentScans.length > 0;
  const hasSchedule = Boolean(milestones.firstScheduleAt) || summary.schedulesSummary.active > 0;
  const assessPaid = Boolean(milestones.assessPaidAt || billing.assessPaidAt);

  if (checkoutSuccess && !dismissed.has("checkout-success")) {
    const product = checkoutSuccess === "monitor" ? "Monitor" : "Assess";
    return (
      <Card tone="feature" className="border border-emerald-500/30 bg-emerald-500/10">
        <Eyebrow>Payment confirmed</Eyebrow>
        <p className="mt-2 text-sm text-emerald-100">
          {product} is active. Next: {checkoutSuccess === "monitor" ? "confirm your schedule" : "run your production baseline"}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => onTabChange(checkoutSuccess === "monitor" ? "monitor" : "scans")}>
            Continue setup
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => onDismiss("checkout-success")}>
            Dismiss
          </Button>
        </div>
      </Card>
    );
  }

  if (hasScans && !hasSchedule && !dismissed.has("schedule-missing")) {
    return (
      <Card tone="ghost" className="border border-amber-500/30 bg-amber-500/10">
        <Eyebrow>Coaching</Eyebrow>
        <p className="mt-2 text-sm text-amber-100">Baseline complete — enable weekly monitoring to catch crypto drift.</p>
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" onClick={() => onTabChange("monitor")}>
            Set up schedule
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => onDismiss("schedule-missing")}>
            Dismiss
          </Button>
        </div>
      </Card>
    );
  }

  if (
    hasScans &&
    !assessPaid &&
    Number(billing.trialScansUsed ?? 0) >= 1 &&
    !dismissed.has("trial-exhausted")
  ) {
    return (
      <Card tone="ghost" className="border border-sky-500/30 bg-sky-500/10">
        <Eyebrow>Trial complete</Eyebrow>
        <p className="mt-2 text-sm text-sky-100">Unlock production baselines and signed evidence with Assess.</p>
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" onClick={() => onOpenUpgrade?.("assess")}>
            Upgrade to Assess
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => onDismiss("trial-exhausted")}>
            Dismiss
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
