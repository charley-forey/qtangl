"use client";

import type { Scenario } from "@/lib/pqc";

export default function ScenarioPicker({
  scenarios,
  activeId,
  onSelect,
}: {
  scenarios: Scenario[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          onClick={() => onSelect(scenario.id)}
          className={`rounded-xl border p-3 text-left transition ${
            scenario.id === activeId
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
              : "border-[var(--color-border)] hover:border-white/20"
          }`}
        >
          <p className="text-sm font-semibold text-white">{scenario.title}</p>
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">{scenario.summary}</p>
        </button>
      ))}
    </div>
  );
}
