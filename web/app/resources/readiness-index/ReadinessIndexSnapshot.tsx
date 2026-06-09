"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { qtanglApiBaseUrl } from "@/lib/api";

type IndexSnapshot = {
  available: boolean;
  reason?: string;
  medianReadiness?: number;
  p25?: number;
  p75?: number;
  sampleSize?: number;
  minCohort?: number;
  disclaimer?: string;
};

export default function ReadinessIndexSnapshot({ industry = "financial" }: { industry?: string }) {
  const [index, setIndex] = useState<IndexSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${qtanglApiBaseUrl}/pqc/index?industry=${encodeURIComponent(industry)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          const detail = await response.text();
          throw new Error(detail || `Request failed (${response.status})`);
        }
        return response.json() as Promise<{ index: IndexSnapshot }>;
      })
      .then((payload) => {
        if (!cancelled) {
          setIndex(payload.index);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load index.");
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
  }, [industry]);

  if (loading) {
    return (
      <Card tone="panel" className="p-6">
        <p className="text-sm text-[var(--muted)]">Loading readiness index…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card tone="panel" className="p-6">
        <p className="text-sm text-red-300">{error}</p>
      </Card>
    );
  }

  if (!index?.available) {
    const reason = index?.reason ?? "unavailable";
    const message =
      reason === "insufficient_cohort"
        ? `Insufficient opted-in cohort volume (minimum ${index?.minCohort ?? 10} tenants).`
        : reason === "index_disabled"
          ? "Readiness Index is temporarily unavailable."
          : "Benchmark data unavailable.";
    return (
      <Card tone="panel" className="p-6">
        <p className="text-sm text-[var(--muted)]">{message}</p>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Anonymized aggregate from opted-in tenants; not attestation.
        </p>
      </Card>
    );
  }

  return (
    <Card tone="panel" className="p-6">
      <dl className="grid gap-4 sm:grid-cols-3 text-center">
        <div>
          <dt className="text-xs uppercase text-[var(--muted)]">Median</dt>
          <dd className="mt-1 text-3xl font-semibold text-white">{index.medianReadiness ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--muted)]">P25</dt>
          <dd className="mt-1 text-3xl font-semibold text-white">{index.p25 ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--muted)]">P75</dt>
          <dd className="mt-1 text-3xl font-semibold text-white">{index.p75 ?? "—"}</dd>
        </div>
      </dl>
      {index.sampleSize != null ? (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Financial services cohort · n={index.sampleSize}
        </p>
      ) : null}
      <p className="mt-6 text-xs text-[var(--muted)]">
        {index.disclaimer ?? "Anonymized aggregate from opted-in tenants; not attestation."}
      </p>
    </Card>
  );
}
