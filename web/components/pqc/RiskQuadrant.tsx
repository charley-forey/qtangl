"use client";

import type { CryptoAsset } from "@/lib/pqc";

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;
const SEVERITY_Y: Record<string, number> = {
  critical: 0.85,
  high: 0.6,
  medium: 0.35,
  low: 0.15,
};

function quadrantLabel(hndl: boolean, severity: string) {
  const exposure = hndl ? "HNDL exposed" : "Lower HNDL";
  return `${severity} · ${exposure}`;
}

export default function RiskQuadrant({ assets }: { assets: CryptoAsset[] }) {
  if (!assets.length) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No assets to plot. Run a scan with discovered endpoints to populate the risk quadrant.
      </p>
    );
  }

  const buckets: Record<string, number> = {};
  for (const asset of assets) {
    const sev = asset.vulnerability.severity;
    const hndl = asset.vulnerability.hndl_exposed ? "hndl" : "no-hndl";
    const key = `${sev}:${hndl}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }

  const width = 320;
  const height = 240;
  const pad = { top: 16, right: 16, bottom: 36, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const dots = assets.slice(0, 40).map((asset, index) => {
    const sev = asset.vulnerability.severity;
    const y = SEVERITY_Y[sev] ?? 0.5;
    const x = asset.vulnerability.hndl_exposed ? 0.75 + (index % 5) * 0.04 : 0.2 + (index % 5) * 0.04;
    return {
      id: asset.id,
      cx: pad.left + x * innerW,
      cy: pad.top + (1 - y) * innerH,
      label: quadrantLabel(asset.vulnerability.hndl_exposed, sev),
    };
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="auto"
        className="max-w-md"
        role="img"
        aria-label="Risk quadrant plot by severity and HNDL exposure"
      >
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.08)"
        />
        <line
          x1={pad.left + innerW / 2}
          y1={pad.top}
          x2={pad.left + innerW / 2}
          y2={pad.top + innerH}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
        />
        <line
          x1={pad.left}
          y1={pad.top + innerH / 2}
          x2={pad.left + innerW}
          y2={pad.top + innerH / 2}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
        />
        <text x={pad.left + 4} y={pad.top + innerH + 20} className="fill-[var(--color-gray-500)] text-[10px]">
          Lower HNDL
        </text>
        <text x={pad.left + innerW - 48} y={pad.top + innerH + 20} className="fill-[var(--color-gray-500)] text-[10px]">
          HNDL exposed
        </text>
        <text x={4} y={pad.top + 12} className="fill-[var(--color-gray-500)] text-[10px]">
          Critical
        </text>
        <text x={4} y={pad.top + innerH} className="fill-[var(--color-gray-500)] text-[10px]">
          Low
        </text>
        {dots.map((dot) => (
          <circle key={dot.id} cx={dot.cx} cy={dot.cy} r={4} fill="rgba(255,255,255,0.7)">
            <title>{dot.label}</title>
          </circle>
        ))}
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {SEVERITY_ORDER.map((severity) => (
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

      <table className="sr-only">
        <caption>Risk quadrant counts</caption>
        <thead>
          <tr>
            <th scope="col">Severity</th>
            <th scope="col">HNDL exposed</th>
            <th scope="col">Other</th>
          </tr>
        </thead>
        <tbody>
          {SEVERITY_ORDER.map((severity) => (
            <tr key={severity}>
              <td>{severity}</td>
              <td>{buckets[`${severity}:hndl`] ?? 0}</td>
              <td>{buckets[`${severity}:no-hndl`] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
