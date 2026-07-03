"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import MetricCard from "@/components/dashboard/ui/MetricCard";
import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

type HndlPayload = {
  exposedCount?: number;
  totalAssets?: number;
  framing?: string;
  items?: Array<{
    assetId: string;
    host?: string;
    exposureScore: number;
    exposureBand: string;
    verdict?: string;
  }>;
};

export default function HndlLensCard({ scanId }: { scanId?: string | null }) {
  const [data, setData] = useState<HndlPayload | null>(null);
  const [filter, setFilter] = useState<"all" | "elevated">("elevated");

  useEffect(() => {
    if (!ccFlags.hndl) return;
    const q = scanId ? `?scan_id=${encodeURIComponent(scanId)}` : "";
    void fetchDashboardJson<HndlPayload>(`/tenant/hndl/exposure${q}`)
      .then(setData)
      .catch(() => setData(null));
  }, [scanId]);

  if (!ccFlags.hndl || !data) return null;

  const items = (data.items ?? []).filter((i) => filter === "all" || i.exposureBand !== "low");

  return (
    <Card tone="panel" className="space-y-3 p-4">
      <Eyebrow>HNDL exposure lens</Eyebrow>
      <p className="text-[10px] text-[var(--color-gray-500)]">{data.framing}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label="HNDL-flagged assets" value={String(data.exposedCount ?? 0)} />
        <MetricCard label="Inventoried assets" value={String(data.totalAssets ?? 0)} />
      </div>
      <div className="flex gap-2 text-[10px]">
        <button
          type="button"
          className={`rounded-full px-2 py-1 ${filter === "elevated" ? "bg-sky-500/20 text-sky-300" : "text-gray-500"}`}
          onClick={() => setFilter("elevated")}
        >
          Elevated+
        </button>
        <button
          type="button"
          className={`rounded-full px-2 py-1 ${filter === "all" ? "bg-sky-500/20 text-sky-300" : "text-gray-500"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>
      <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
        {items.map((item) => (
          <li key={item.assetId} className="rounded-lg border border-[var(--border-subtle)] px-2 py-1.5">
            <span className="font-medium text-white">{item.host ?? item.assetId}</span>
            <span className="ml-2 text-amber-300">{item.exposureBand}</span>
            {item.verdict ? <p className="mt-1 text-[10px] text-[var(--color-gray-500)]">{item.verdict}</p> : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
