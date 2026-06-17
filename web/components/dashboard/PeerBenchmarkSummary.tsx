"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

type BenchmarkResponse = {
  benchmarkOptIn?: boolean;
  comparison?: {
    available?: boolean;
    yourScore?: number;
    median?: number;
    band?: string;
    sampleSize?: number;
    delta?: number;
    percentileEstimate?: number;
  };
  index?: {
    available?: boolean;
    medianReadiness?: number;
    sampleSize?: number;
  };
};

function formatBand(band: string | undefined): string {
  if (!band) return "—";
  return band.replace(/_/g, " ");
}

export default function PeerBenchmarkSummary({ scanId }: { scanId: string | null }) {
  const [peer, setPeer] = useState<BenchmarkResponse | null>(null);

  useEffect(() => {
    if (!scanId) return;
    fetchDashboardJson<BenchmarkResponse>("/tenant/benchmarks")
      .then(setPeer)
      .catch(() => setPeer(null));
  }, [scanId]);

  const optedIn = Boolean(peer?.benchmarkOptIn);
  const comparison = peer?.comparison;
  const available = optedIn && Boolean(comparison?.available);

  if (!optedIn) {
    return (
      <Card tone="ghost" className="border border-[var(--border-subtle)]">
        <Eyebrow>Peer benchmark</Eyebrow>
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Opt in under Settings to compare readiness against anonymized industry cohorts.
        </p>
      </Card>
    );
  }

  if (!available) {
    return (
      <Card tone="ghost" className="border border-[var(--border-subtle)]">
        <Eyebrow>Peer benchmark</Eyebrow>
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Cohort data is still building — check back after more opted-in scans in your industry.
        </p>
      </Card>
    );
  }

  return (
    <Card tone="panel">
      <Eyebrow>Peer benchmark</Eyebrow>
      <p className="mt-2 text-sm text-white">
        Your score: {comparison?.yourScore ?? "—"} · Median: {comparison?.median ?? peer?.index?.medianReadiness ?? "—"} ·
        Band: {formatBand(comparison?.band)}
      </p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Cohort size: {comparison?.sampleSize ?? peer?.index?.sampleSize ?? "—"}
        {comparison?.delta != null ? ` · ${comparison.delta >= 0 ? "+" : ""}${comparison.delta} vs median` : ""}
      </p>
    </Card>
  );
}
