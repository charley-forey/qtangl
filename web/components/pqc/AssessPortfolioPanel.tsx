"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchTenantJson } from "@/lib/tenant-api";

type PortfolioTarget = {
  target?: string;
  label?: string;
  businessUnit?: string;
  latestReadinessScore?: number;
};

type PortfolioResponse = {
  targets?: PortfolioTarget[];
  rollup?: { overallReadiness?: number; targetCount?: number };
};

export default function AssessPortfolioPanel({ apiKey }: { apiKey?: string }) {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    async function load() {
      try {
        const payload = await fetchTenantJson<PortfolioResponse>("/tenant/portfolio", apiKey!);
        if (!cancelled) setData(payload);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load portfolio.");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  if (!apiKey) {
    return (
      <p className="text-sm text-[var(--color-gray-500)]">
        Connect your tenant API key to preview portfolio targets from your workspace.
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  const targets = data?.targets ?? [];
  if (targets.length === 0) {
    return (
      <Card tone="ghost" className="rounded-xl">
        <p className="text-sm text-[var(--color-gray-400)]">
          No portfolio targets yet. Add domains in the dashboard to track multi-domain readiness from Assess.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data?.rollup?.overallReadiness != null ? (
        <p className="text-sm text-[var(--color-gray-300)]">
          Portfolio rollup: <span className="text-white">{data.rollup.overallReadiness}</span> across{" "}
          {targets.length} target(s)
        </p>
      ) : null}
      <ul className="space-y-2">
        {targets.slice(0, 8).map((item) => (
          <li
            key={`${item.target}-${item.label}`}
            className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm"
          >
            <span className="text-white">{item.label ?? item.target}</span>
            <span className="text-[var(--color-gray-400)]">
              {item.latestReadinessScore != null ? item.latestReadinessScore : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
