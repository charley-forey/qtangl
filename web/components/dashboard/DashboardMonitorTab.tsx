"use client";

import { useState } from "react";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import MonitorScheduleSuccessCard, {
  type MonitorScheduleSuccess,
} from "@/components/dashboard/MonitorScheduleSuccessCard";
import MonitorRecentActivity from "@/components/dashboard/MonitorRecentActivity";
import MonitorAdvancedSection from "@/components/dashboard/MonitorAdvancedSection";
import MonitorHealthStrip from "@/components/dashboard/MonitorHealthStrip";
import ScheduleRecommendationCard from "@/components/dashboard/ScheduleRecommendationCard";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSummary, MonitorTabBundle } from "@/lib/dashboard-state";

const ScheduleManager = dynamic(() => import("@/components/dashboard/ScheduleManager"));

type Props = {
  bundle: MonitorTabBundle | null;
  summary: DashboardSummary;
  savedKey: string;
  bffMode?: boolean;
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
  bffMode = false,
  tenantSettings,
  canAdmin = false,
  onMessage,
  onRefresh,
  onTabChange,
  onOpenUpgrade,
  onDismissScheduleRecommendation,
}: Props) {
  const schedules = bundle?.schedules ?? [];
  const hasSchedules = schedules.length > 0;
  const schedulerEnabled = Boolean(summary.health.schedulerEnabled ?? summary.me.schedulerEnabled);
  const scanAllowlist = (tenantSettings?.scanAllowlist as string[] | undefined) ?? [];
  const coaching = (tenantSettings?.coaching as { bannersDismissed?: string[] } | undefined) ?? {};
  const scheduleRecommendationDismissed = (coaching.bannersDismissed ?? []).includes("schedule-recommendation");
  const maxScansPerMonth =
    summary.kpis.quotaLimit ??
    ((summary.me.entitlements as { maxScansPerMonth?: number } | undefined)?.maxScansPerMonth ?? null);
  const entitlements = summary.me.entitlements as { tier?: string; maxSchedules?: number } | undefined;
  const tier = entitlements?.tier ?? "free";
  const maxSchedules = entitlements?.maxSchedules ?? 0;
  const readinessScore = summary.kpis.latestReadiness ?? summary.latestScanDetail?.readinessScore ?? null;
  const [scheduleSuccess, setScheduleSuccess] = useState<MonitorScheduleSuccess | null>(null);

  return (
    <div className="space-y-6" id="dashboard-monitor">
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

      {!hasSchedules ? (
        maxSchedules > 0 && scheduleRecommendationDismissed ? (
          <Card tone="panel">
            <Eyebrow>Scheduled monitoring</Eyebrow>
            <div className="mt-4">
              <ScheduleManager
                schedules={[]}
                onRefresh={onRefresh}
                onMessage={onMessage}
                onOpenUpgrade={onOpenUpgrade}
                maxScansPerMonth={maxScansPerMonth}
                maxSchedules={maxSchedules}
                onScheduleCreated={(target, cadenceHours) => {
                  setScheduleSuccess({ target, cadenceHours });
                }}
              />
            </div>
          </Card>
        ) : (
          <ScheduleRecommendationCard
            scanAllowlist={scanAllowlist}
            tier={tier}
            maxSchedules={maxSchedules}
            readinessScore={readinessScore}
            dismissed={scheduleRecommendationDismissed}
            onDismiss={onDismissScheduleRecommendation}
            onMessage={onMessage}
            onRefresh={onRefresh}
            onOpenUpgrade={onOpenUpgrade}
            onOpenScans={() => onTabChange?.("scans")}
            onScheduleCreated={(target, cadenceHours) => {
              setScheduleSuccess({ target, cadenceHours });
            }}
          />
        )
      ) : (
        <Card tone="panel">
          <Eyebrow>Scheduled monitoring</Eyebrow>
          <div className="mt-4">
            <ScheduleManager
              schedules={schedules}
              onRefresh={onRefresh}
              onMessage={onMessage}
              onOpenUpgrade={onOpenUpgrade}
              maxScansPerMonth={maxScansPerMonth}
              maxSchedules={maxSchedules}
              onScheduleCreated={(target, cadenceHours) => {
                setScheduleSuccess({ target, cadenceHours });
              }}
            />
          </div>
        </Card>
      )}

      <MonitorScheduleSuccessCard
        success={scheduleSuccess}
        onDismiss={() => setScheduleSuccess(null)}
        onTabChange={(tab) => onTabChange?.(tab)}
      />

      <MonitorRecentActivity
        hasSchedules={hasSchedules}
        onNavigateTab={(tab) => onTabChange?.(tab as DashboardTabId)}
      />

      <MonitorAdvancedSection
        bundle={bundle}
        summary={summary}
        savedKey={savedKey}
        bffMode={bffMode}
        canAdmin={canAdmin}
        onMessage={onMessage}
        onTabChange={onTabChange}
      />
    </div>
  );
}
