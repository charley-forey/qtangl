"use client";

import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";

export default function MonitorHeroKpiStrip() {
  const { scenario } = useMonitorScenario();
  const delta = scenario.readinessDelta;
  const deltaLabel = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  const deltaClass =
    delta < 0 ? "text-red-300" : delta > 0 ? "text-emerald-300" : "text-white";

  const chips = [
    { label: "Readiness", value: scenario.readinessScore.toFixed(1) },
    { label: "Delta", value: deltaLabel, className: deltaClass },
    { label: "New Q-vuln", value: String(scenario.newQuantumVulnerableCount) },
    { label: "Certs ≤30d", value: String(scenario.certExpiringCount) },
    { label: "Cadence", value: scenario.cadence },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="rounded-xl border border-[var(--border)] bg-black/40 px-4 py-3"
        >
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            {chip.label}
          </p>
          <p className={`mt-1 text-xl font-semibold text-white ${chip.className ?? ""}`}>
            {chip.value}
          </p>
        </div>
      ))}
    </div>
  );
}
