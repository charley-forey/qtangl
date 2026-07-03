"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type DriftIntelResponse = {
  status?: string;
  available?: boolean;
  reason?: string;
  industry?: string;
  patternType?: string;
  sampleSize?: number;
  metrics?: Record<string, number | string>;
  asOf?: string;
};

const REASON_COPY: Record<string, string> = {
  opt_in_required: "Opt in to anonymized benchmarking under Settings to see cohort drift patterns.",
  insufficient_cohort: "Cohort data is still building for your industry — check back later.",
  unavailable: "Drift intelligence is temporarily unavailable.",
};

export default function DriftIntelPanel() {
  const [data, setData] = useState<DriftIntelResponse | null>(null);

  useEffect(() => {
    void fetchDashboardJson<DriftIntelResponse>("/tenant/drift-intel")
      .then((result) => {
        setData(result);
        trackDashboardEvent({ event: "cc_drift_intel_viewed", properties: { available: Boolean(result.available) } });
      })
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  if (!data.available) {
    return (
      <Card tone="ghost" className="border border-[var(--border-subtle)]">
        <Eyebrow>Cohort drift intel</Eyebrow>
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          {REASON_COPY[data.reason ?? "unavailable"] ?? REASON_COPY.unavailable}
        </p>
      </Card>
    );
  }

  const metrics = Object.entries(data.metrics ?? {});

  return (
    <Card tone="panel" className="space-y-3">
      <Eyebrow>Cohort drift intel</Eyebrow>
      <p className="text-xs text-[var(--color-gray-400)]">
        Anonymized aggregate for {data.industry ?? "your industry"} ({data.sampleSize ?? 0} tenants). Directional signal,
        not a benchmark of your specific estate.
      </p>
      {data.patternType ? (
        <p className="text-sm text-white">Dominant pattern: {data.patternType.replace(/_/g, " ")}</p>
      ) : null}
      {metrics.length > 0 ? (
        <dl className="grid gap-2 sm:grid-cols-2">
          {metrics.map(([key, value]) => (
            <div key={key} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
              <dt className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">{key.replace(/_/g, " ")}</dt>
              <dd className="mt-1 text-sm text-white">{String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {data.asOf ? <p className="text-[10px] text-[var(--color-gray-500)]">As of {data.asOf.slice(0, 10)}</p> : null}
    </Card>
  );
}
