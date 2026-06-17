"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import MonitorHealthStrip from "@/components/dashboard/MonitorHealthStrip";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSummary, MonitorTabBundle } from "@/lib/dashboard-state";
import { navigateDashboardDeepLink } from "@/lib/dashboard-deep-links";



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

  onMessage: (message: string) => void;

  onRefresh: () => void;

  onTabChange?: (tab: string) => void;

};



export default function DashboardMonitorTab({ bundle, summary, savedKey, onMessage, onRefresh, onTabChange }: Props) {
  const cc = bundle?.commandCenter ?? summary.commandCenter;

  return (
    <DashboardSection title="Monitor control tower" id="dashboard-monitor">
      <MonitorHealthStrip summary={summary} />

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

          <ScheduleManager schedules={bundle?.schedules ?? []} onRefresh={onRefresh} onMessage={onMessage} />

        </div>

      </Card>

    </DashboardSection>

  );

}

