"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { monitorCopy } from "@/lib/copy/monitor";
import type { DashboardSummary, MonitorTabBundle } from "@/lib/dashboard-state";

const IntegrationSettings = dynamic(() => import("@/components/dashboard/IntegrationSettings"));
const WebhookDlqPanel = dynamic(() => import("@/components/dashboard/WebhookDlqPanel"));
const MonitorCbomDriftSection = dynamic(() => import("@/components/dashboard/MonitorCbomDriftSection"));
const HostDriftWidget = dynamic(() => import("@/components/drift/HostDriftWidget"));
const DriftPortfolioPanel = dynamic(() => import("@/components/drift/DriftPortfolioPanel"));
const BusinessUnitHeatmap = dynamic(() => import("@/components/dashboard/BusinessUnitHeatmap"));
const FleetEnrollmentPanel = dynamic(() => import("@/components/discovery/FleetEnrollmentPanel"));
const AgentFleetTable = dynamic(() => import("@/components/discovery/AgentFleetTable"));

const STORAGE_KEY = "qtangl_monitor_advanced_open";

type Props = {
  bundle: MonitorTabBundle | null;
  summary: DashboardSummary;
  savedKey: string;
  bffMode?: boolean;
  canAdmin: boolean;
  onMessage: (message: string) => void;
  onTabChange?: (tab: string) => void;
};

export default function MonitorAdvancedSection({
  bundle,
  summary,
  savedKey,
  bffMode = false,
  canAdmin,
  onMessage,
  onTabChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const cc = bundle?.commandCenter ?? summary.commandCenter;
  const ccV2 = useCommandCenterV2();
  const hasHeatmap =
    !ccV2 && Boolean(cc?.businessUnits && Object.keys(cc.businessUnits).length > 0);
  const fleetKey = bffMode ? { useBff: true as const } : { apiKey: savedKey };

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setOpen((value) => {
      const next = !value;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={toggle}
        aria-expanded={open}
      >
        <div>
          <Eyebrow>{monitorCopy.advanced.toggle}</Eyebrow>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">{monitorCopy.advanced.description}</p>
        </div>
        <span className="text-xs text-[var(--color-gray-400)]">{open ? "Hide" : "Show"}</span>
      </button>

      {open ? (
        <div className="mt-6 space-y-4 border-t border-[var(--border-subtle)] pt-6">
          <Card tone="panel">
            <FleetEnrollmentPanel {...fleetKey} />
          </Card>
          <Card tone="panel">
            <Eyebrow>Enrolled agents</Eyebrow>
            <div className="mt-4">
              <AgentFleetTable {...fleetKey} />
            </div>
          </Card>
          {hasHeatmap ? (
            <Card tone="panel">
              <Eyebrow>Portfolio heatmap</Eyebrow>
              <div className="mt-4">
                <BusinessUnitHeatmap
                  businessUnits={cc!.businessUnits!}
                  deltas={cc!.businessUnitDeltas}
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
        </div>
      ) : null}
    </Card>
  );
}
