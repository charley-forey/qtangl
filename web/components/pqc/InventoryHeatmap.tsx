"use client";

import type { CryptoAsset } from "@/lib/pqc";
import { PqcChip } from "./ui";

export default function InventoryHeatmap({ assets }: { assets: CryptoAsset[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-lg border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">{asset.label}</p>
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
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">
            {asset.kind} · {asset.host}
            {asset.port ? `:${asset.port}` : ""}
          </p>
          <p className="mt-2 text-xs text-[var(--color-gray-300)]">{asset.vulnerability.summary}</p>
        </div>
      ))}
    </div>
  );
}
