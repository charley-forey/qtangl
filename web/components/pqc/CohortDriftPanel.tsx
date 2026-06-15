"use client";

import { useEffect, useState } from "react";

import { useQtanglClient } from "@qtangl/sdk-react";

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

export default function CohortDriftPanel() {
  const client = useQtanglClient();
  const [data, setData] = useState<DriftIntelPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    client
      .drift.intel()
      .then((payload) => {
        if (!cancelled) {
          setData(payload as DriftIntelPayload);
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
  }, [client]);

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
            <p className="text-lg text-white">{(dropRate * 100).toFixed(1)}%</p>
          </div>
        ) : null}
        {avgProjected != null ? (
          <div>
            <p className="text-xs text-[var(--color-gray-500)]">Avg projected readiness</p>
            <p className="text-lg text-white">{avgProjected}</p>
          </div>
        ) : null}
        {data.industry ? (
          <div>
            <p className="text-xs text-[var(--color-gray-500)]">Industry cohort</p>
            <p className="text-white">{data.industry}</p>
          </div>
        ) : null}
        {data.sampleSize != null ? (
          <div>
            <p className="text-xs text-[var(--color-gray-500)]">Sample size</p>
            <p className="text-white">{data.sampleSize}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
