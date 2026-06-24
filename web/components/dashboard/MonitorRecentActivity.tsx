"use client";

import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { monitorCopy } from "@/lib/copy/monitor";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

const AlertTimeline = dynamic(() => import("@/components/dashboard/AlertTimeline"));
const DriftTimeline = dynamic(() => import("@/components/dashboard/DriftTimeline"));

type Props = {
  hasSchedules: boolean;
  onNavigateTab?: (tab: DashboardTabId) => void;
};

export default function MonitorRecentActivity({ hasSchedules, onNavigateTab }: Props) {
  return (
    <Card tone="panel">
      <Eyebrow>{monitorCopy.recentActivity.title}</Eyebrow>
      {!hasSchedules ? (
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">{monitorCopy.recentActivity.empty}</p>
      ) : null}
      <div className="mt-4 space-y-4">
        <AlertTimeline onNavigateTab={(tab) => onNavigateTab?.(tab as DashboardTabId)} />
        <DriftTimeline />
      </div>
      {!hasSchedules && onNavigateTab ? (
        <div className="mt-4">
          <Button type="button" size="sm" variant="secondary" onClick={() => onNavigateTab("scans")}>
            {monitorCopy.recentActivity.emptyCta}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
