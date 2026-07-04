"use client";

import type { ReactNode } from "react";

import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardKpiData } from "@/components/dashboard/DashboardKpiStrip";
import type { DashboardSummary } from "@/lib/dashboard-state";
import PostureCommandBar from "@/components/qros/PostureCommandBar";
import GlobalLensBar from "@/components/qros/GlobalLensBar";
import AmbientCopilotBar from "@/components/qros/AmbientCopilotBar";
import { QrosLensProvider } from "@/lib/qros-lens-context";

type Props = {
  summary: DashboardSummary;
  kpis: DashboardKpiData;
  activeTab: DashboardTabId;
  persona: "executive" | "operator";
  onTabChange: (tab: DashboardTabId) => void;
  children: ReactNode;
};

export default function QrosShell({
  summary,
  kpis,
  activeTab,
  persona,
  onTabChange,
  children,
}: Props) {
  return (
    <QrosLensProvider>
      <div className="space-y-4">
        <PostureCommandBar kpis={kpis} summary={summary} activeTab={activeTab} onTabChange={onTabChange} />
        <GlobalLensBar />
        <AmbientCopilotBar persona={persona} />
        {children}
      </div>
    </QrosLensProvider>
  );
}
