"use client";

import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";

type KpiChip = {
  label: string;
  value: string;
  className?: string;
  highlight?: boolean;
};

export default function MonitorHeroKpiStrip() {
  const { scenario } = useMonitorScenario();
  const delta = scenario.readinessDelta;
  const deltaLabel = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  const deltaClass =
    delta < 0 ? "text-red-300" : delta > 0 ? "text-emerald-300" : "text-white";

  const chips: KpiChip[] = [
    { label: "Readiness", value: scenario.readinessScore.toFixed(1), highlight: true },
    { label: "Delta", value: deltaLabel, className: deltaClass },
    { label: "New Q-vuln", value: String(scenario.newQuantumVulnerableCount) },
    { label: "Certs ≤30d", value: String(scenario.certExpiringCount) },
    { label: "Cadence", value: scenario.cadence },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4"
      role="list"
      aria-label="Monitor KPI summary"
    >
      {chips.map((chip) => (
        <div
          key={chip.label}
          role="listitem"
          className={[
            "rounded-[var(--radius-xl)] border px-4 py-4 sm:px-5 sm:py-5",
            chip.highlight
              ? "border-white/20 bg-white/[0.06]"
              : "border-[var(--border)] bg-black/40",
          ].join(" ")}
        >
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            {chip.label}
          </p>
          <p
            className={[
              "mt-1.5 font-semibold tabular-nums text-white",
              chip.highlight ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              chip.className ?? "",
            ].join(" ")}
          >
            {chip.value}
          </p>
        </div>
      ))}
    </div>
  );
}
