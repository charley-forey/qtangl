"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import OpsShell from "@/components/ops/OpsShell";
import OpsProvisionForm from "@/components/ops/OpsProvisionForm";

type Summary = {
  totals?: {
    tenants?: number;
    users?: number;
    scansLast30Days?: number;
    signupsLast7Days?: number;
    signupsLast30Days?: number;
  };
  tierBreakdown?: Record<string, number>;
  schedulerEnabled?: boolean;
};

type FunnelPayload = {
  funnel?: Array<{ stage: string; count: number; conversionPct?: number | null }>;
};

type DogfoodSummary = {
  freshness?: { allFresh?: boolean };
};

export default function OpsHubClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [funnel, setFunnel] = useState<FunnelPayload | null>(null);
  const [dogfoodFresh, setDogfoodFresh] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com";
    Promise.all([
      fetch("/api/ops/platform/summary").then((r) => (r.ok ? r.json() : Promise.reject(new Error("Summary failed")))),
      fetch("/api/ops/funnel?days=30").then((r) => (r.ok ? r.json() : Promise.reject(new Error("Funnel failed")))),
      fetch(`${apiBase}/pqc/dogfood/summary`)
        .then((r) => (r.ok ? (r.json() as Promise<DogfoodSummary>) : null))
        .catch(() => null),
    ])
      .then(([summaryPayload, funnelPayload, dogfoodPayload]) => {
        setSummary(summaryPayload);
        setFunnel(funnelPayload);
        setDogfoodFresh(dogfoodPayload?.freshness?.allFresh ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load ops data"));
  }, []);

  const totals = summary?.totals ?? {};

  return (
    <OpsShell title="Platform overview" subtitle="Internal console for tenant provisioning, usage, and health.">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tenants" value={totals.tenants} />
        <KpiCard label="Users" value={totals.users} />
        <KpiCard label="Scans (30d)" value={totals.scansLast30Days} />
        <KpiCard label="Signups (7d)" value={totals.signupsLast7Days} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card tone="panel">
          <Eyebrow>Tier breakdown</Eyebrow>
          <ul className="mt-3 space-y-1 text-sm text-[var(--color-gray-300)]">
            {Object.entries(summary?.tierBreakdown ?? {}).map(([tier, count]) => (
              <li key={tier} className="flex justify-between">
                <span>{tier}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--color-gray-500)]">
            Scheduler: {summary?.schedulerEnabled ? "enabled" : "offline"}
          </p>
        </Card>

        <Card tone="panel">
          <Eyebrow>Golden path (30d)</Eyebrow>
          <ul className="mt-3 space-y-1 text-sm text-[var(--color-gray-300)]">
            {(funnel?.funnel ?? []).map((stage) => (
              <li key={stage.stage} className="flex justify-between gap-2">
                <span>{stage.stage}</span>
                <span>
                  {stage.count}
                  {stage.conversionPct != null ? ` (${stage.conversionPct}%)` : ""}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/ops/funnel" className="mt-3 inline-block text-xs underline">
            Full funnel view
          </Link>
        </Card>

        <Card tone="panel">
          <Eyebrow>Dogfood freshness</Eyebrow>
          <p className="mt-3 text-sm">
            Status:{" "}
            <span className={dogfoodFresh ? "text-emerald-300" : "text-amber-300"}>
              {dogfoodFresh === null ? "Loading…" : dogfoodFresh ? "All targets fresh" : "Stale or missing"}
            </span>
          </p>
          <Link href="/ops/dogfood" className="mt-3 inline-block text-xs underline">
            Dogfood ops
          </Link>
        </Card>
      </div>

      <OpsProvisionForm onCreated={() => window.location.assign("/ops/tenants")} />
    </OpsShell>
  );
}

function KpiCard({ label, value }: { label: string; value?: number }) {
  return (
    <Card tone="panel">
      <Eyebrow>{label}</Eyebrow>
      <p className="mt-2 text-2xl font-semibold">{value ?? "—"}</p>
    </Card>
  );
}
