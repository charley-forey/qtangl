"use client";

import type { CryptoAsset } from "@/lib/pqc";

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"] as const;

export default function RiskQuadrant({ assets }: { assets: CryptoAsset[] }) {
  const buckets: Record<string, number> = {};
  for (const asset of assets) {
    const sev = asset.vulnerability.severity;
    const hndl = asset.vulnerability.hndl_exposed ? "hndl" : "no-hndl";
    const key = `${sev}:${hndl}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {SEVERITY_ORDER.slice(0, 4).map((severity) => (
        <div key={severity} className="rounded-lg border border-[var(--border-subtle)] p-3">
          <p className="mb-2 uppercase tracking-[0.12em] text-[var(--color-gray-500)]">{severity}</p>
          <p className="text-white">
            HNDL: <span className="font-mono">{buckets[`${severity}:hndl`] ?? 0}</span>
          </p>
          <p className="text-[var(--color-gray-400)]">
            Other: <span className="font-mono">{buckets[`${severity}:no-hndl`] ?? 0}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
