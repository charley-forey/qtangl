"use client";

import { useEffect, useMemo, useState } from "react";

import { AmplitudeBarsContent } from "@/components/visualization/quantum/AmplitudeBars";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import { trackEvent } from "@/lib/analytics";
import type { AuditPack } from "@/lib/ev-fleet";

import EvFleetDrawer from "./EvFleetDrawer";
import { EvFleetEmptyState, EvFleetTabs } from "./ui";

const tabs = [
  { id: "constraints", label: "Constraints" },
  { id: "costs", label: "Costs" },
  { id: "qpu", label: "QPU trace" },
  { id: "qubo", label: "QUBO" },
  { id: "repro", label: "Repro" },
] as const;

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
}

export default function AuditDrawer({
  auditPacks,
  candidateId,
  open,
  onClose,
}: {
  auditPacks: AuditPack[];
  candidateId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("constraints");
  const pack = useMemo(
    () => auditPacks.find((item) => item.candidate_id === candidateId) ?? auditPacks[0] ?? null,
    [auditPacks, candidateId]
  );

  useEffect(() => {
    if (open) {
      setActiveTab("constraints");
      trackEvent("ev_fleet_audit_opened", { candidateId });
    }
  }, [open, candidateId]);

  if (!open) {
    return null;
  }

  if (!pack) {
    return (
      <EvFleetDrawer open={open} onClose={onClose} title="Audit pack" subtitle="Run a solve first.">
        <EvFleetEmptyState title="No audit pack" description="Solve then open audit from a plan card." />
      </EvFleetDrawer>
    );
  }

  const qpuTotal = pack.qpu_trace.distribution.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <EvFleetDrawer
      open={open}
      onClose={onClose}
      title={pack.candidate_id}
      subtitle="TOU, site cap, and QPU trace for depot ops review."
    >
      <div className="demo-drawer-sticky-tabs">
        <EvFleetTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="demo-drawer-content space-y-4">
        {activeTab === "constraints"
          ? pack.binding_constraints.map((c) => (
              <div key={c.id} className="ev-fleet-audit-block">
                <p className="font-medium text-white">{c.label}</p>
                <p className="mt-2 text-sm text-[var(--color-gray-400)]">{c.detail}</p>
              </div>
            ))
          : null}
        {activeTab === "costs" ? (
          <div className="ev-fleet-audit-block">
            <dl className="space-y-2 text-sm">
              {Object.entries(pack.cost_breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-[var(--color-gray-500)]">{formatLabel(key)}</dt>
                  <dd className="text-white">{typeof value === "number" ? value.toFixed(2) : String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
        {activeTab === "qpu" ? (
          <div className="ev-fleet-audit-block">
            <p className="text-sm text-[var(--color-gray-400)]">{pack.qpu_trace.summary}</p>
            <AmplitudeBarsContent
              items={pack.qpu_trace.distribution.map((item) => ({
                label: item.decodedPlanId,
                value: Math.round((item.count / qpuTotal) * 100),
                caption: item.bitstring,
              }))}
            />
          </div>
        ) : null}
        {activeTab === "qubo" ? (
          <div className="space-y-4">
            <HybridStackDiagram variant="embedded" className="ev-fleet-audit-block !overflow-visible" />
            <pre className="max-h-48 overflow-auto rounded-lg bg-black/50 p-3 text-xs text-[var(--color-gray-400)]">
              {JSON.stringify(pack.qubo_snapshot, null, 2)}
            </pre>
          </div>
        ) : null}
        {activeTab === "repro" ? (
          <pre className="ev-fleet-audit-block text-xs text-[var(--color-gray-400)]">
            {JSON.stringify(pack.reproducibility, null, 2)}
          </pre>
        ) : null}
      </div>
    </EvFleetDrawer>
  );
}
