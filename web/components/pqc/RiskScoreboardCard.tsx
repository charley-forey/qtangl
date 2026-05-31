"use client";

import type { Scoreboard } from "@/lib/pqc";

import InfoTip from "./InfoTip";

export default function RiskScoreboardCard({ scoreboard }: { scoreboard: Scoreboard }) {
  const columns = [scoreboard.manual, scoreboard.qtangl];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {columns.map((col) => (
        <div key={col.label} className="rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--color-gray-400)]">{col.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{col.readiness_score}</p>
          <p className="flex items-center gap-1 text-xs text-[var(--color-gray-400)]">
            <InfoTip termId="readiness_score" label="Q-Day readiness score" />
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-gray-300)]">
            <div>
              <dt className="text-[var(--color-gray-500)]">Assets</dt>
              <dd>{col.assets_discovered}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-gray-500)]">Quantum-vuln</dt>
              <dd>{col.quantum_vulnerable}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[var(--color-gray-500)]">
                <InfoTip termId="hndl" label="HNDL exposed" />
              </dt>
              <dd>{col.hndl_exposed}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[var(--color-gray-500)]">
                <InfoTip termId="remediation_coverage" label="Remediation cov." />
              </dt>
              <dd>{col.remediation_coverage}%</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[var(--color-gray-400)]">{col.summary}</p>
        </div>
      ))}
    </div>
  );
}
