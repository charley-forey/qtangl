"use client";

import type { CryptoAsset } from "@/lib/pqc";
import { PqcChip } from "./ui";

function isPqcReady(asset: CryptoAsset) {
  return Boolean(asset.pqcReady ?? asset.pqc_ready);
}

export default function InventoryHeatmap({ assets }: { assets: CryptoAsset[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {assets.map((asset) => (
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
            {asset.negotiated_group ? ` · ${asset.negotiated_group}` : ""}
          </p>
          <p className="mt-2 text-xs text-[var(--color-gray-300)]">{asset.vulnerability.summary}</p>
        </div>
      ))}
    </div>
  );
}
