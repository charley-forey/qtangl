"use client";

import type { CryptoAsset } from "@/lib/pqc";

export default function SeverityDonut({ assets }: { assets: CryptoAsset[] }) {
  const counts = assets.reduce<Record<string, number>>((acc, asset) => {
    const key = asset.vulnerability.severity;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const total = assets.length || 1;
  const entries = Object.entries(counts);
  if (assets.length === 0) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No severity data captured. This scan may have found zero classified assets or returned partial
        coverage.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {entries.map(([severity, count]) => (
        <div key={severity} className="text-center">
          <p className="text-lg font-semibold text-white">{Math.round((count / total) * 100)}%</p>
          <p className="text-[10px] uppercase text-[var(--color-gray-500)]">{severity}</p>
        </div>
      ))}
    </div>
  );
}
