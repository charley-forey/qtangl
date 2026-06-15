"use client";

import { useEffect, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { compareToBenchmark, getPqcIndex } from "@/lib/pqc";

const BAND_STYLES: Record<string, { label: string; className: string }> = {
  above_peers: { label: "Above peers", className: "text-emerald-300" },
  within_band: { label: "Within peer band", className: "text-[var(--color-gray-300)]" },
  below_peers: { label: "Below peers", className: "text-amber-300" },
};

type PublicPeerBandPanelProps = {
  score: number;
  industry?: string;
};

export default function PublicPeerBandPanel({ score, industry = "financial" }: PublicPeerBandPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ReturnType<typeof compareToBenchmark> | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPqcIndex(industry)
      .then((payload) => {
        if (cancelled) return;
        setComparison(compareToBenchmark(score, payload.index));
        setDisclaimer(payload.index.disclaimer ?? null);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load peer index.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [score, industry]);

  if (loading) {
    return <p className="text-sm text-[var(--color-gray-500)]">Loading industry benchmark…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  if (!comparison?.available) {
    const reason = comparison?.reason ?? "unavailable";
    if (reason === "insufficient_cohort") {
      return (
        <div className="rounded-xl border border-[var(--border-subtle)] p-4">
          <Eyebrow>Industry benchmark</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Insufficient anonymized cohort volume for {industry} benchmarks yet.
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
      <Eyebrow>Industry benchmark · {industry}</Eyebrow>
      {band ? <p className={`mt-2 text-sm font-medium ${band.className}`}>{band.label}</p> : null}
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
      {disclaimer ? (
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">{disclaimer}</p>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">
          Anonymized aggregate from opted-in tenants. Not a formal attestation.
        </p>
      )}
    </div>
  );
}
