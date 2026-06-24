"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { monitorCopy, scheduleSuccessMessage } from "@/lib/copy/monitor";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

export type MonitorScheduleSuccess = {
  target: string;
  cadenceHours: number;
};

type Props = {
  success: MonitorScheduleSuccess | null;
  onDismiss: () => void;
  onTabChange?: (tab: DashboardTabId) => void;
};

export default function MonitorScheduleSuccessCard({ success, onDismiss, onTabChange }: Props) {
  if (!success) return null;

  return (
    <Card tone="feature" className="border border-emerald-500/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Eyebrow>{monitorCopy.scheduleSuccess.title}</Eyebrow>
        <button type="button" className="text-xs text-[var(--color-gray-500)] hover:text-white" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
      <p className="mt-2 text-sm text-emerald-100">
        {scheduleSuccessMessage(success.target, success.cadenceHours)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => onTabChange?.("scans")}>
          {monitorCopy.scheduleSuccess.viewScans}
        </Button>
      </div>
    </Card>
  );
}
