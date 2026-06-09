"use client";

import { useEffect, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { fetchTenantJson } from "@/lib/tenant-api";

type BenchmarkComparison = {
  available: boolean;
  reason?: string;
  band?: "above_peers" | "within_band" | "below_peers";
  yourScore?: number;
  median?: number;
  p25?: number;
  p75?: number;
  sampleSize?: number;
  delta?: number;
};

type BenchmarksPayload = {
  comparison: BenchmarkComparison | null;
  index?: { available?: boolean; reason?: string; minCohort?: number };
  benchmarkOptIn?: boolean;
};

const BAND_STYLES: Record<string, { label: string; className: string }> = {
  above_peers: { label: "Above peers", className: "text-emerald-300" },
  within_band: { label: "Within peer band", className: "text-[var(--color-gray-300)]" },
  below_peers: { label: "Below peers", className: "text-amber-300" },
};

export default function PeerComparisonPanel({ apiKey }: { apiKey: string }) {
  const [data, setData] = useState<BenchmarksPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTenantJson<BenchmarksPayload>("/tenant/benchmarks", apiKey)
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load benchmarks.");
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
    return <p className="text-sm text-[var(--color-gray-500)]">Loading peer comparison…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  const comparison = data?.comparison;

  if (!comparison) {
    return (
      <p className="text-sm text-[var(--color-gray-400)]">
        Complete a scan with a readiness score to compare against your industry cohort.
      </p>
    );
  }

  if (!comparison.available) {
    const reason = comparison.reason ?? data?.index?.reason ?? "unavailable";
    if (reason === "insufficient_cohort") {
      const min = data?.index?.minCohort ?? 10;
      return (
        <div className="rounded-xl border border-[var(--border-subtle)] p-4">
          <Eyebrow>Peer comparison</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Insufficient cohort volume for anonymized benchmarks (minimum {min} opted-in tenants).
          </p>
        </div>
      );
    }
    return (
      <p className="text-sm text-[var(--color-gray-400)]">
        Peer benchmarks unavailable{reason !== "unavailable" ? `: ${reason.replace(/_/g, " ")}` : ""}.
      </p>
    );
  }

  const band = comparison.band ? BAND_STYLES[comparison.band] : null;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-4">
      <Eyebrow>Peer comparison</Eyebrow>
      {band ? (
        <p className={`mt-2 text-sm font-medium ${band.className}`}>{band.label}</p>
      ) : null}
      {comparison.yourScore != null ? (
        <p className="mt-1 text-xs text-[var(--color-gray-500)]">
          Your score {comparison.yourScore}
          {comparison.delta != null ? ` · ${comparison.delta >= 0 ? "+" : ""}${comparison.delta} vs median` : ""}
        </p>
      ) : null}
      <dl className="mt-4 grid gap-3 sm:grid-cols-4 text-sm">
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Median</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{comparison.median ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">P25</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{comparison.p25 ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">P75</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{comparison.p75 ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Cohort size</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{comparison.sampleSize ?? "—"}</dd>
        </div>
      </dl>
      {data?.benchmarkOptIn === false ? (
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">
          Opt in under Alert settings to contribute anonymized scores to the index.
        </p>
      ) : null}
    </div>
  );
}
