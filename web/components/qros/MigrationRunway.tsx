"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchRunway, simulateScenario } from "@/lib/qros-api";
import type { RunwayData } from "@/lib/qros-types";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function MigrationRunway() {
  const [runway, setRunway] = useState<RunwayData | null>(null);
  const [projection, setProjection] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRunway()
      .then(setRunway)
      .finally(() => setLoading(false));
  }, []);

  const runScenario = async (scenarioId: string) => {
    trackDashboardEvent({ event: "cc_qros_runway_scenario", properties: { scenarioId } });
    const result = await simulateScenario(scenarioId);
    setProjection(result.projectedReadiness);
  };

  if (loading) {
    return (
      <Card tone="panel" className="animate-pulse p-6">
        <div className="h-4 w-32 rounded bg-white/10" />
      </Card>
    );
  }

  if (!runway) {
    return <EmptyState title="Runway unavailable" description="Complete a scan to populate the migration timeline." />;
  }

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Migration runway</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">{runway.framing}</p>
      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-[32rem] gap-4">
          {runway.milestones.map((m) => (
            <div key={m.id} className="min-w-[10rem] flex-1 border-l border-[var(--border-subtle)] pl-3">
              <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]">{m.date}</p>
              <p className="mt-1 text-sm font-medium text-white">{m.label}</p>
              <p className="mt-1 text-xs text-[var(--color-gray-400)]">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {runway.scenarios.map((s) => (
          <Button key={s.id} type="button" variant="secondary" onClick={() => void runScenario(s.id)}>
            {s.label}
          </Button>
        ))}
      </div>
      {projection != null ? (
        <p className="mt-3 text-sm text-sky-200">Projected readiness: {projection.toFixed(0)} / 100</p>
      ) : null}
    </Card>
  );
}
