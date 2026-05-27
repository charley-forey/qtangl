"use client";

import Button from "@/components/ui/Button";
import type { Scenario } from "@/lib/hospital";

import { HospitalSection, HospitalSectionHeader } from "./ui";

type ScenarioPickerProps = {
  scenarios: Scenario[];
  activeScenarioId: string;
  onChange: (scenarioId: string) => void;
};

export default function ScenarioPicker({
  scenarios,
  activeScenarioId,
  onChange,
}: ScenarioPickerProps) {
  return (
    <HospitalSection>
      <HospitalSectionHeader
        label="Scenarios"
        title="Choose the call-out event"
        description="Each scenario uses a real constraint stack—skills, fatigue, union rules, and cost ladder."
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
              className="hospital-scenario-card"
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
        <Button href="/demo/hospital/methodology" variant="secondary" size="sm">
          Methodology
        </Button>
        <Button href="/access?source=demo-hospital" variant="ghost" size="sm">
          Request pilot
        </Button>
      </div>
    </HospitalSection>
  );
}
