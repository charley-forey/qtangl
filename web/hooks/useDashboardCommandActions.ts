"use client";

import { useMemo } from "react";

import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

export type DashboardCommandAction = {
  id: string;
  label: string;
  onSelect: () => void;
};

export function useDashboardCommandActions({
  onTabChange,
  onRunBaseline,
  onExportBoard,
  onConfigureSso,
}: {
  onTabChange: (tab: DashboardTabId) => void;
  onRunBaseline: () => void;
  onExportBoard: () => void;
  onConfigureSso: () => void;
}) {
  return useMemo(
    (): DashboardCommandAction[] => [
      { id: "baseline", label: "Run baseline scan", onSelect: onRunBaseline },
      { id: "schedule", label: "Create schedule", onSelect: () => onTabChange("monitor") },
      { id: "invite", label: "Invite teammate", onSelect: () => onTabChange("settings") },
      { id: "export", label: "Export board report", onSelect: onExportBoard },
      { id: "sso", label: "Configure SSO", onSelect: onConfigureSso },
    ],
    [onConfigureSso, onExportBoard, onRunBaseline, onTabChange]
  );
}
