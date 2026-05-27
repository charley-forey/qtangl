"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import AmplitudeBars from "@/components/visualization/quantum/AmplitudeBars";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import { trackEvent } from "@/lib/analytics";
import type { AuditPack } from "@/lib/hospital";

type AuditDrawerProps = {
  auditPacks: AuditPack[];
  candidateId: string | null;
  open: boolean;
  onClose: () => void;
};

const tabs = [
  { id: "qubo", label: "QUBO snapshot" },
  { id: "constraints", label: "Binding constraints" },
  { id: "costs", label: "Cost breakdown" },
  { id: "qpu", label: "Cached QPU trace" },
  { id: "repro", label: "Reproducibility" },
] as const;

export default function AuditDrawer({ auditPacks, candidateId, open, onClose }: AuditDrawerProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("qubo");
  const pack = useMemo(
    () => auditPacks.find((item) => item.candidate_id === candidateId) ?? auditPacks[0] ?? null,
    [auditPacks, candidateId]
  );

  useEffect(() => {
    if (open && pack) {
      trackEvent("audit_tab_viewed", { candidateId: pack.candidate_id, tab: activeTab });
    }
  }, [activeTab, open, pack]);

  if (!open || !pack) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-[2px]">
      <div className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-[var(--border)] bg-[#040507] p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-label">Audit pack</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{pack.candidate_id}</h3>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                activeTab === tab.id
                  ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                  : "border-[var(--border)] text-[var(--color-gray-300)]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex-1 overflow-auto space-y-5 pr-1">
          {activeTab === "qubo" ? (
            <>
              <HybridStackDiagram />
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5">
                <p className="text-sm leading-7 text-[var(--color-gray-300)]">
                  Variables: {pack.qubo_snapshot.variableCount ?? 0}
                </p>
                <pre className="mt-4 overflow-auto text-xs leading-6 text-[var(--color-gray-300)]">
                  {JSON.stringify(pack.qubo_snapshot, null, 2)}
                </pre>
              </div>
            </>
          ) : null}

          {activeTab === "constraints" ? (
            <div className="space-y-3">
              {pack.binding_constraints.map((constraint) => (
                <div
                  key={constraint.id}
                  className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white">{constraint.label}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                      {constraint.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                    {constraint.detail}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "costs" ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5">
              <pre className="overflow-auto text-xs leading-6 text-[var(--color-gray-300)]">
                {JSON.stringify(pack.cost_breakdown, null, 2)}
              </pre>
            </div>
          ) : null}

          {activeTab === "qpu" ? (
            <AmplitudeBars
              items={pack.qpu_trace.distribution.map((item) => ({
                label: item.decodedCandidateId,
                value: Math.round((item.count / 256) * 100),
                caption: item.bitstring,
              }))}
            />
          ) : null}

          {activeTab === "repro" ? (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5">
              <pre className="overflow-auto text-xs leading-6 text-[var(--color-gray-300)]">
                {JSON.stringify(pack.reproducibility, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
