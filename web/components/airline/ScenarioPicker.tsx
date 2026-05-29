"use client";

import Button from "@/components/ui/Button";
import type { Scenario } from "@/lib/airline";

import { AirlineSection, AirlineSectionHeader } from "./ui";

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
    <AirlineSection>
      <AirlineSectionHeader
        label="Scenarios"
        title="Choose the disruption event"
        description="Each scenario exercises tail routing, FAR 117 crew legality, and recovery cost trade-offs."
      />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {scenarios.map((scenario) => {
          const active = scenario.id === activeScenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              data-active={active}
              onClick={() => onChange(scenario.id)}
              className="airline-scenario-card"
            >
              <p className="text-sm font-semibold text-white">{scenario.title}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-5 text-[var(--color-gray-400)]">
                {scenario.summary}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-5">
        <Button href="/demo/airline/methodology" variant="secondary" size="sm">
          Methodology
        </Button>
        <Button href="/access?source=demo-airline" variant="ghost" size="sm">
          Request pilot
        </Button>
      </div>
    </AirlineSection>
  );
}
