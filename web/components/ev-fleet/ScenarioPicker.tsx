"use client";

import type { Scenario } from "@/lib/ev-fleet";

import { EvFleetSection, EvFleetSectionHeader } from "./ui";

export default function ScenarioPicker({
  scenarios,
  activeScenarioId,
  onChange,
}: {
  scenarios: Scenario[];
  activeScenarioId: string;
  onChange: (scenarioId: string) => void;
}) {
  return (
    <EvFleetSection>
      <EvFleetSectionHeader
        label="Scenarios"
        title="Pick a depot day"
        description="Each scenario changes TOU pressure, demand spikes, or fleet availability."
      />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {scenarios.map((scenario) => {
          const active = scenario.id === activeScenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onChange(scenario.id)}
              className={[
                "rounded-[var(--radius-lg)] border p-4 text-left transition",
                active
                  ? "border-emerald-400/40 bg-emerald-950/30 ring-1 ring-emerald-400/20"
                  : "border-[var(--border)] bg-black/20 hover:border-[var(--border-strong)]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-white">{scenario.title}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-gray-400)]">{scenario.summary}</p>
            </button>
          );
        })}
      </div>
    </EvFleetSection>
  );
}
