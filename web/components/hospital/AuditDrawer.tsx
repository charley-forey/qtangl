"use client";

import { useEffect, useMemo, useState } from "react";

import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import AmplitudeBars from "@/components/visualization/quantum/AmplitudeBars";
import { trackEvent } from "@/lib/analytics";
import type { AuditPack } from "@/lib/hospital";

import HospitalDrawer from "./HospitalDrawer";
import { HospitalTabs } from "./ui";

type AuditDrawerProps = {
  auditPacks: AuditPack[];
  candidateId: string | null;
  open: boolean;
  onClose: () => void;
};

const tabs = [
  { id: "constraints", label: "Constraints" },
  { id: "costs", label: "Costs" },
  { id: "qpu", label: "QPU trace" },
  { id: "qubo", label: "QUBO" },
  { id: "repro", label: "Repro" },
] as const;

function formatCostLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AuditDrawer({ auditPacks, candidateId, open, onClose }: AuditDrawerProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("constraints");
  const pack = useMemo(
    () => auditPacks.find((item) => item.candidate_id === candidateId) ?? auditPacks[0] ?? null,
    [auditPacks, candidateId]
  );

  useEffect(() => {
    if (open && pack) {
      trackEvent("audit_tab_viewed", { candidateId: pack.candidate_id, tab: activeTab });
    }
  }, [activeTab, open, pack]);

  if (!pack) {
    return null;
  }

  const repro = pack.reproducibility as Record<string, unknown>;
  const costEntries = Object.entries(pack.cost_breakdown ?? {});

  return (
    <HospitalDrawer
      open={open}
      onClose={onClose}
      title={pack.candidate_id.replace(/^hybrid-|^classical-/, "").replace(/-/g, " ")}
      subtitle="Binding rules, cost deltas, and hardware trace for compliance review."
    >
      <HospitalTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-4">
        {activeTab === "constraints" ? (
          <div className="space-y-3">
            {pack.binding_constraints.map((constraint) => (
              <div key={constraint.id} className="hospital-audit-block">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{constraint.label}</p>
                  <span className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
                    {constraint.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">
                  {constraint.detail}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "costs" ? (
          <div className="hospital-audit-block">
            <p className="text-sm text-[var(--color-gray-400)]">
              Dollar and penalty breakdown versus the manual baseline.
            </p>
            <dl className="mt-4 space-y-3">
              {costEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-[var(--color-gray-400)]">{formatCostLabel(key)}</dt>
                  <dd className="font-medium tabular-nums text-white">
                    {typeof value === "number" ? value.toLocaleString() : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {activeTab === "qpu" ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[var(--color-gray-400)]">
              {pack.qpu_trace.summary}
            </p>
            <AmplitudeBars
              items={pack.qpu_trace.distribution.map((item) => ({
                label: item.decodedCandidateId,
                value: Math.round((item.count / 256) * 100),
                caption: item.bitstring,
              }))}
            />
          </div>
        ) : null}

        {activeTab === "qubo" ? (
          <div className="space-y-4">
            <HybridStackDiagram />
            <div className="hospital-audit-block">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--color-gray-500)]">Variables</dt>
                  <dd className="mt-1 text-white">{pack.qubo_snapshot.variableCount ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-gray-500)]">Hard λ</dt>
                  <dd className="mt-1 text-white">
                    {pack.qubo_snapshot.penalties?.hardConstraintLambda ?? "—"}
                  </dd>
                </div>
              </dl>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-[var(--color-gray-400)]">
                  Raw QUBO snapshot
                </summary>
                <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/50 p-3 text-xs leading-6 text-[var(--color-gray-400)]">
                  {JSON.stringify(pack.qubo_snapshot, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        ) : null}

        {activeTab === "repro" ? (
          <div className="hospital-audit-block space-y-3 text-sm">
            {Object.entries(repro).map(([key, value]) => (
              <div key={key}>
                <p className="text-[var(--color-gray-500)]">{formatCostLabel(key)}</p>
                <p className="mt-1 break-all font-mono text-xs text-[var(--color-gray-300)]">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </HospitalDrawer>
  );
}
