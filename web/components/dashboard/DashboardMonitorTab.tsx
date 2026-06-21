"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import MonitorHealthStrip from "@/components/dashboard/MonitorHealthStrip";
import ScheduleRecommendationCard from "@/components/dashboard/ScheduleRecommendationCard";
import WebhookDlqPanel from "@/components/dashboard/WebhookDlqPanel";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSummary, MonitorTabBundle } from "@/lib/dashboard-state";



const IntegrationSettings = dynamic(() => import("@/components/dashboard/IntegrationSettings"));

const ScheduleManager = dynamic(() => import("@/components/dashboard/ScheduleManager"));

const MonitorCbomDriftSection = dynamic(() => import("@/components/dashboard/MonitorCbomDriftSection"));

const DriftPortfolioPanel = dynamic(() => import("@/components/drift/DriftPortfolioPanel"));

const HostDriftWidget = dynamic(() => import("@/components/drift/HostDriftWidget"));

const AlertTimeline = dynamic(() => import("@/components/dashboard/AlertTimeline"));

const DriftTimeline = dynamic(() => import("@/components/dashboard/DriftTimeline"));



type Props = {

  bundle: MonitorTabBundle | null;

  summary: DashboardSummary;

  savedKey: string;

  tenantSettings?: Record<string, unknown> | null;

  canAdmin?: boolean;

  onMessage: (message: string) => void;

  onRefresh: () => void;

  onTabChange?: (tab: string) => void;

  onOpenUpgrade?: (product: "monitor") => void;

  onDismissScheduleRecommendation?: () => void;

};



export default function DashboardMonitorTab({
  bundle,
  summary,
  savedKey,
  tenantSettings,
  canAdmin = false,
  onMessage,
  onRefresh,
  onTabChange,
  onOpenUpgrade,
  onDismissScheduleRecommendation,
}: Props) {
  const cc = bundle?.commandCenter ?? summary.commandCenter;
  const schedulerEnabled = Boolean(summary.health.schedulerEnabled ?? summary.me.schedulerEnabled);
  const scanAllowlist = (tenantSettings?.scanAllowlist as string[] | undefined) ?? [];
  const coaching = (tenantSettings?.coaching as { bannersDismissed?: string[] } | undefined) ?? {};
  const scheduleRecommendationDismissed = (coaching.bannersDismissed ?? []).includes("schedule-recommendation");
  const maxScansPerMonth =
    summary.kpis.quotaLimit ??
    ((summary.me.entitlements as { maxScansPerMonth?: number } | undefined)?.maxScansPerMonth ?? null);

  return (
    <DashboardSection title="Monitor control tower" id="dashboard-monitor">
      <MonitorHealthStrip summary={summary} schedulerEnabled={schedulerEnabled} />

      {!schedulerEnabled ? (
        <Card tone="ghost" className="border border-amber-500/30 bg-amber-500/10">
          <Eyebrow>Scheduler offline</Eyebrow>
          <p className="mt-2 text-sm text-amber-100">
            The monitoring scheduler is not running on this deployment. Scheduled re-scans will not fire until the
            worker is enabled — contact your admin or upgrade to Monitor tier.
          </p>
        </Card>
      ) : null}

      {(bundle?.schedules ?? []).length === 0 ? (
        <ScheduleRecommendationCard
          scanAllowlist={scanAllowlist}
          dismissed={scheduleRecommendationDismissed}
          onDismiss={onDismissScheduleRecommendation}
          onMessage={onMessage}
          onRefresh={onRefresh}
          onOpenUpgrade={onOpenUpgrade}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AlertTimeline
          onNavigateTab={(tab) => onTabChange?.(tab as DashboardTabId)}
        />

        <DriftTimeline />

      </div>



      {cc?.businessUnits && Object.keys(cc.businessUnits).length > 0 ? (

        <Card tone="panel">

          <Eyebrow>Portfolio heatmap</Eyebrow>

          <div className="mt-4">

            <BusinessUnitHeatmap

              businessUnits={cc.businessUnits}

              deltas={cc.businessUnitDeltas}

              onSelectUnit={() => onTabChange?.("monitor")}

            />

          </div>

        </Card>

      ) : null}



      <Card tone="panel">

        <Eyebrow>Webhook &amp; ticketing</Eyebrow>

        <div className="mt-4">

          <IntegrationSettings onMessage={onMessage} />

        </div>

      </Card>

      {canAdmin ? (
        <Card tone="panel">
          <WebhookDlqPanel onMessage={onMessage} />
        </Card>
      ) : null}

      <Card tone="panel">

        <Eyebrow>CBOM aggregate</Eyebrow>

        <p className="mt-2 text-sm text-[var(--color-gray-300)]">

          Components: {bundle?.cbomAggregate?.componentCount ?? 0} · Open conflicts:{" "}

          {bundle?.cbomAggregate?.openConflicts ?? 0}

        </p>

      </Card>

      <Card tone="panel">

        <MonitorCbomDriftSection />

      </Card>

      <Card tone="panel">

        <Eyebrow>Host drift</Eyebrow>

        <div className="mt-4">

          <HostDriftWidget apiKey={savedKey} />

        </div>

      </Card>

      <Card tone="panel">

        <DriftPortfolioPanel />

      </Card>

      <Card tone="panel">

        <Eyebrow>Scheduled monitoring</Eyebrow>

        <div className="mt-4">

          <ScheduleManager
            schedules={bundle?.schedules ?? []}
            onRefresh={onRefresh}
            onMessage={onMessage}
            onOpenUpgrade={onOpenUpgrade}
            maxScansPerMonth={maxScansPerMonth}
          />

        </div>

      </Card>

    </DashboardSection>

  );

}
