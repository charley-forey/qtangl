"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { Scenario } from "@/lib/hospital";

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
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-label">Scenario picker</p>
      <h2 className="mt-3 text-xl font-semibold text-white">Pick the hospital event to replay</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {scenarios.map((scenario) => {
          const active = scenario.id === activeScenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onChange(scenario.id)}
              className={[
                "rounded-[var(--radius-xl)] border p-4 text-left transition",
                active
                  ? "border-[var(--border-strong)] bg-white/[0.08]"
                  : "border-[var(--border)] bg-black/35 hover:border-[var(--border-strong)]",
              ].join(" ")}
            >
              <p className="text-sm font-medium text-white">{scenario.title}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                {scenario.summary}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button href="/demo/hospital/methodology" variant="secondary">
          Read methodology
        </Button>
        <Button href="/access?source=demo-hospital" variant="ghost">
          Request pilot access
        </Button>
      </div>
    </Card>
  );
}
