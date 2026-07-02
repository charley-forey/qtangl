"use client";

import type { CryptoAsset } from "@/lib/pqc";
import { PqcChip } from "./ui";

function isPqcReady(asset: CryptoAsset) {
  return Boolean(asset.pqcReady ?? asset.pqc_ready);
}

const SEVERITY_INTENSITY: Record<string, string> = {
  critical: "bg-red-500/70",
  high: "bg-amber-500/60",
  medium: "bg-slate-400/40",
  low: "bg-slate-600/30",
  info: "bg-slate-700/25",
};

export default function InventoryHeatmap({
  assets,
  explanations,
}: {
  assets: CryptoAsset[];
  explanations?: Record<string, string>;
}) {
  if (!assets.length) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No crypto assets discovered for this run. Check target reachability, scan mode, and uploaded bundle
        contents.
      </p>
    );
  }

  const algorithms = [...new Set(assets.map((a) => a.algorithm || a.vulnerability.algorithm))].slice(0, 6);
  const severities = ["critical", "high", "medium", "low"] as const;

  const grid: Record<string, Record<string, number>> = {};
  for (const algo of algorithms) {
    grid[algo] = {};
    for (const sev of severities) {
      grid[algo][sev] = 0;
    }
  }

  for (const asset of assets) {
    const algo = asset.algorithm || asset.vulnerability.algorithm;
    if (!grid[algo]) continue;
    const sev = asset.vulnerability.severity;
    if (grid[algo][sev] !== undefined) {
      grid[algo][sev] += 1;
    }
  }

  const maxCount = Math.max(
    1,
    ...algorithms.flatMap((algo) => severities.map((sev) => grid[algo]?.[sev] ?? 0))
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-xs">
          <caption className="sr-only">Algorithm by severity heatmap</caption>
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-3 text-left text-[var(--color-gray-500)]">
                Algorithm
              </th>
              {severities.map((sev) => (
                <th key={sev} scope="col" className="px-2 py-2 text-center uppercase text-[var(--color-gray-500)]">
                  {sev}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {algorithms.map((algo) => (
              <tr key={algo}>
                <th scope="row" className="py-2 pr-3 text-left font-mono text-[var(--color-gray-300)]">
                  {algo}
                </th>
                {severities.map((sev) => {
                  const count = grid[algo]?.[sev] ?? 0;
                  const intensity =
                    count === 0
                      ? "bg-white/[0.03]"
                      : count / maxCount > 0.66
                        ? SEVERITY_INTENSITY[sev]
                        : count / maxCount > 0.33
                          ? `${SEVERITY_INTENSITY[sev]?.replace(/\/\d+/, "/40")}`
                          : `${SEVERITY_INTENSITY[sev]?.replace(/\/\d+/, "/20")}`;
                  return (
                    <td key={sev} className="px-2 py-2 text-center">
                      <div
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded ${intensity}`}
                        title={`${algo} · ${sev}: ${count}`}
                      >
                        {count > 0 ? <span className="font-mono text-white">{count}</span> : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {assets.slice(0, 6).map((asset) => (
          <div key={asset.id} className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">{asset.label}</p>
              <div className="flex flex-wrap gap-1">
                {isPqcReady(asset) && <PqcChip tone="ok">PQC hybrid</PqcChip>}
                <PqcChip
                  tone={
                    asset.vulnerability.severity === "critical" || asset.vulnerability.severity === "high"
                      ? "danger"
                      : asset.vulnerability.status === "safe"
                        ? "ok"
                        : "warn"
                  }
                >
                  {asset.vulnerability.status}
                </PqcChip>
              </div>
            </div>
            <p className="mt-1 text-xs text-[var(--color-gray-400)]">
              {asset.kind} · {asset.host}
              {asset.port ? `:${asset.port}` : ""}
            </p>
            {explanations?.[asset.id] ? (
              <p className="mt-2 text-xs italic text-[var(--color-gray-400)]">
                What this means: {explanations[asset.id]}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
