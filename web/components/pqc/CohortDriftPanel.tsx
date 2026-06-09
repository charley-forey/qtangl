"use client";

import { useEffect, useState } from "react";

import { fetchTenantJson } from "@/lib/tenant-api";

type DriftIntelPayload = {
  available: boolean;
  reason?: string;
  industry?: string;
  sampleSize?: number;
  metrics?: {
    dropRate?: number;
    avgProjectedReadiness?: number | null;
  };
  asOf?: string;
};

export default function CohortDriftPanel({ apiKey }: { apiKey: string }) {
  const [data, setData] = useState<DriftIntelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTenantJson<DriftIntelPayload>("/tenant/drift-intel", apiKey)
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load drift intel.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  if (loading) {
    return <p className="text-sm text-[var(--color-gray-500)]">Loading cohort drift…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  if (!data?.available) {
    const reason = data?.reason ?? "unavailable";
    const message =
      reason === "opt_in_required"
        ? "Opt in to anonymized benchmarks to unlock cohort drift intelligence."
        : reason === "insufficient_cohort"
          ? "Insufficient opted-in cohort volume for drift patterns."
          : "Cohort drift intelligence unavailable.";
    return (
      <div>
        <p className="text-xs uppercase text-[var(--color-gray-500)]">Cohort drift</p>
        <p className="mt-1 text-sm text-[var(--color-gray-400)]">{message}</p>
      </div>
    );
  }

  const dropRate = data.metrics?.dropRate;
  const avgProjected = data.metrics?.avgProjectedReadiness;

  return (
    <div>
      <p className="text-xs uppercase text-[var(--color-gray-500)]">Cohort drift</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 text-sm text-[var(--color-gray-300)]">
        {dropRate != null ? (
          <div>
            <p className="text-xs text-[var(--color-gray-500)]">Drop rate</p>
            <p className="mt-1 text-white">{Math.round(dropRate * 100)}%</p>
            <p className="text-xs text-[var(--color-gray-500)]">
              Share of cohort with readiness anomalies
            </p>
          </div>
        ) : null}
        {avgProjected != null ? (
          <div>
            <p className="text-xs text-[var(--color-gray-500)]">Avg projected readiness</p>
            <p className="mt-1 text-white">{avgProjected}</p>
            {data.sampleSize != null ? (
              <p className="text-xs text-[var(--color-gray-500)]">
                {data.industry ?? "Industry"} cohort · n={data.sampleSize}
                {data.asOf ? ` · ${data.asOf}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
