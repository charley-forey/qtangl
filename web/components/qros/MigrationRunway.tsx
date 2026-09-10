"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchRunway, simulateScenario } from "@/lib/qros-api";
import { useQrosQuery } from "@/lib/qros-hooks";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function MigrationRunway() {
  const { data: runway, loading, error } = useQrosQuery(fetchRunway, []);
  const [projection, setProjection] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  const runScenario = async (scenarioId: string) => {
    trackDashboardEvent({ event: "cc_qros_runway_scenario", properties: { scenarioId } });
    setSimulating(true);
    setScenarioError(null);
    setProjection(null);
    try {
      const result = await simulateScenario(scenarioId);
      setProjection(result.projectedReadiness);
    } catch {
      setScenarioError("Unable to simulate this scenario. Please try again.");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <Card tone="panel" className="animate-pulse p-6" aria-busy="true">
        <div className="h-4 w-32 rounded bg-white/10" />
      </Card>
    );
  }

  if (error || !runway?.milestones?.length) {
    return <EmptyState title="Runway unavailable" description="Complete a scan to populate the migration timeline." />;
  }

  const milestones = runway.milestones ?? [];
  const scenarios = runway.scenarios ?? [];

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Migration runway</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">{runway.framing}</p>
      <div className="mt-4 overflow-x-auto" role="list" aria-label="Migration milestones">
        <div className="flex min-w-[32rem] gap-4">
          {milestones.map((m) => (
            <div key={m.id} className="min-w-[10rem] flex-1 border-l border-[var(--border-subtle)] pl-3" role="listitem">
              <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]">{m.date}</p>
              <p className="mt-1 text-sm font-medium text-white">{m.label}</p>
              <p className="mt-1 text-xs text-[var(--color-gray-400)]">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {scenarios.map((s) => (
          <Button key={s.id} type="button" variant="secondary" disabled={simulating} onClick={() => void runScenario(s.id)}>
            {s.label}
          </Button>
        ))}
      </div>
      {scenarioError ? <p role="alert" className="mt-3 text-sm text-red-300">{scenarioError}</p> : null}
      {projection != null ? (
        <p className="mt-3 text-sm text-sky-200" aria-live="polite">
          Illustrative readiness: {projection.toFixed(0)} / 100 — not a validated forecast
        </p>
      ) : null}
    </Card>
  );
}
