"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";

export default function MonitorPeerBenchmarkPreview() {
  const { scenario } = useMonitorScenario();
  const { peerBenchmark: peer } = scenario;

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Peer benchmark (opt-in cohort)</Eyebrow>
      <p className="mt-2 text-xs text-[var(--color-gray-500)]">
        Anonymized industry comparison when benchmark opt-in is enabled on your tenant. Illustrative
        fixture — not live cohort data.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4 text-center">
          <p className="text-xs text-[var(--color-gray-500)]">Your score</p>
          <p className="mt-2 text-2xl font-semibold text-white">{peer.yourScore}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4 text-center">
          <p className="text-xs text-[var(--color-gray-500)]">Industry median</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-gray-300)]">{peer.median}</p>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">{peer.industry}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4 text-center">
          <p className="text-xs text-[var(--color-gray-500)]">p25 – p75</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-gray-300)]">
            {peer.p25} – {peer.p75}
          </p>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">n={peer.sampleSize}</p>
        </div>
      </div>

      <div className="relative mt-6 h-3 rounded-full bg-black/60" role="img" aria-label="Benchmark band">
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${peer.p25}%`,
            width: `${peer.p75 - peer.p25}%`,
            background: "rgba(56, 189, 248, 0.3)",
          }}
        />
        <div
          className="absolute top-0 h-3 w-0.5 bg-white"
          style={{ left: `${peer.yourScore}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-sm text-[var(--color-gray-400)]">
        You are{" "}
        {peer.yourScore >= peer.median ? "above" : "below"} median for {peer.industry} (
        {(peer.yourScore - peer.median).toFixed(1)} pts).
      </p>
    </Card>
  );
}
