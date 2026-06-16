"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import type { MonitorTabBundle } from "@/lib/dashboard-state";

const IntegrationSettings = dynamic(() => import("@/components/dashboard/IntegrationSettings"));
const ScheduleManager = dynamic(() => import("@/components/dashboard/ScheduleManager"));
const CbomDriftWidget = dynamic(() => import("@/components/pqc/CbomDriftWidget"));
const DriftPortfolioPanel = dynamic(() => import("@/components/drift/DriftPortfolioPanel"));

type Props = {
  bundle: MonitorTabBundle | null;
  savedKey: string;
  onMessage: (message: string) => void;
  onRefresh: () => void;
};

export default function DashboardMonitorTab({ bundle, savedKey, onMessage, onRefresh }: Props) {
  return (
    <DashboardSection title="Integrations" id="dashboard-monitor">
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
        <CbomDriftWidget drift={null} />
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
