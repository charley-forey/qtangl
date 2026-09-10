"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { simulateScenario } from "@/lib/qros-api";

const SCENARIOS = [
  { id: "baseline", label: "Current pace" },
  { id: "accelerated", label: "Accelerated program" },
  { id: "conservative", label: "Conservative" },
];

export default function ScenarioSimulatorPanel() {
  const [result, setResult] = useState<{
    projectedReadiness: number;
    confidenceBand: { low: number; high: number };
    assumptions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (scenarioId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = await simulateScenario(scenarioId);
      setResult(payload);
    } catch {
      setError("Unable to simulate this scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Scenario simulator</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Illustrative what-if scenarios, not validated forecasts or statistical confidence intervals.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <Button key={s.id} type="button" variant="secondary" disabled={loading} onClick={() => void run(s.id)}>
            {s.label}
          </Button>
        ))}
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
      {result ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/40 p-4 text-sm">
          <p className="text-white">Projected readiness: {result.projectedReadiness.toFixed(0)}</p>
          <p className="mt-1 text-[var(--color-gray-400)]">
            Illustrative range: {result.confidenceBand.low.toFixed(0)} – {result.confidenceBand.high.toFixed(0)}
          </p>
          <ul className="mt-2 list-disc pl-4 text-xs text-[var(--color-gray-500)]">
            {result.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
