"use client";

import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import { monitorScenarioList, type MonitorScenarioId } from "@/lib/copy/monitor-scenarios";

export default function MonitorScenarioPicker() {
  const { scenarioId, setScenarioId } = useMonitorScenario();

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Industry scenario"
    >
      {monitorScenarioList.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          role="tab"
          aria-selected={scenarioId === scenario.id}
          onClick={() => setScenarioId(scenario.id as MonitorScenarioId)}
          className={[
            "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
            scenarioId === scenario.id
              ? "border-white/30 bg-white/10 text-white"
              : "border-[var(--border)] text-[var(--color-gray-400)] hover:border-[var(--border-strong)] hover:text-white",
          ].join(" ")}
        >
          {scenario.label}
        </button>
      ))}
    </div>
  );
}
