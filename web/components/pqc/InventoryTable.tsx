"use client";

import { Fragment, useMemo, useState } from "react";

import type { CryptoAsset } from "@/lib/pqc";
import { PqcChip } from "./ui";

type SortKey = "severity" | "host" | "algorithm";
type FilterStatus = "all" | "quantum_vulnerable" | "transitional" | "safe";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

function severityRank(severity: string) {
  return SEVERITY_ORDER[severity] ?? 5;
}

function algorithmFamily(asset: CryptoAsset) {
  const algo = asset.algorithm || asset.vulnerability.algorithm;
  if (!algo) return "unknown";
  if (algo.includes("RSA")) return algo.match(/RSA-\d+/)?.[0] ?? "RSA";
  if (algo.includes("ECDSA") || algo.includes("P-256") || algo.includes("P-384")) return "ECDSA";
  if (algo.includes("ML-KEM") || algo.includes("Kyber")) return "PQC-KEM";
  return algo.split("-")[0] ?? algo;
}

export default function InventoryTable({
  assets,
  explanations,
  view = "table",
  onViewChange,
}: {
  assets: CryptoAsset[];
  explanations?: Record<string, string>;
  view?: "table" | "cards";
  onViewChange?: (view: "table" | "cards") => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rollup = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of assets) {
      const family = algorithmFamily(asset);
      counts.set(family, (counts.get(family) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [assets]);

  const filtered = useMemo(() => {
    let list = [...assets];
    if (filterStatus !== "all") {
      list = list.filter((a) => {
        const status = a.vulnerability.status;
        if (filterStatus === "quantum_vulnerable") {
          return status === "broken" || status === "at-risk";
        }
        if (filterStatus === "transitional") return status === "at-risk";
        if (filterStatus === "safe") return status === "safe";
        return true;
      });
    }
    list.sort((a, b) => {
      if (sortKey === "severity") {
        return severityRank(a.vulnerability.severity) - severityRank(b.vulnerability.severity);
      }
      if (sortKey === "host") return a.host.localeCompare(b.host);
      return (a.algorithm || "").localeCompare(b.algorithm || "");
    });
    return list;
  }, [assets, filterStatus, sortKey]);

  function exportCsv() {
    const header = ["host", "port", "kind", "algorithm", "severity", "status"];
    const rows = filtered.map((a) =>
      [a.host, a.port ?? "", a.kind, a.algorithm, a.vulnerability.severity, a.vulnerability.status]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qtangl-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!assets.length) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No crypto assets discovered. Check target reachability and scan mode.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-gray-400)]">
        {rollup.map(([family, count]) => (
          <span key={family} className="rounded-full bg-white/5 px-2 py-1">
            {family}: {count}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-[var(--color-gray-400)]">
          Sort
          <select
            className="ml-2 rounded border border-[var(--color-border)] bg-black/30 px-2 py-1 text-white"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="severity">Severity</option>
            <option value="host">Host</option>
            <option value="algorithm">Algorithm</option>
          </select>
        </label>
        <label className="text-xs text-[var(--color-gray-400)]">
          Status
          <select
            className="ml-2 rounded border border-[var(--color-border)] bg-black/30 px-2 py-1 text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="all">All</option>
            <option value="quantum_vulnerable">Quantum-vulnerable</option>
            <option value="safe">Safe</option>
          </select>
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-white hover:border-white/30"
        >
          Export CSV
        </button>
        {onViewChange && (
          <button
            type="button"
            onClick={() => onViewChange(view === "table" ? "cards" : "table")}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-white hover:border-white/30"
          >
            {view === "table" ? "Card view" : "Table view"}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-gray-500)]">
              <th className="py-2 pr-3">Host</th>
              <th className="py-2 pr-3">Kind</th>
              <th className="py-2 pr-3">Algorithm</th>
              <th className="py-2 pr-3">Severity</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => (
              <Fragment key={asset.id}>
                <tr
                  className="cursor-pointer border-b border-[var(--color-border)]/50 hover:bg-white/[0.02]"
                  onClick={() => setExpandedId(expandedId === asset.id ? null : asset.id)}
                >
                  <td className="py-2 pr-3 text-white">
                    {asset.host}
                    {asset.port ? `:${asset.port}` : ""}
                  </td>
                  <td className="py-2 pr-3 text-[var(--color-gray-300)]">{asset.kind}</td>
                  <td className="py-2 pr-3 text-[var(--color-gray-300)]">{asset.algorithm}</td>
                  <td className="py-2 pr-3">
                    <PqcChip
                      tone={
                        asset.vulnerability.severity === "critical" || asset.vulnerability.severity === "high"
                          ? "danger"
                          : "warn"
                      }
                    >
                      {asset.vulnerability.severity}
                    </PqcChip>
                  </td>
                  <td className="py-2 text-[var(--color-gray-300)]">{asset.vulnerability.status}</td>
                </tr>
                {expandedId === asset.id && (
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td colSpan={5} className="py-2 text-[var(--color-gray-400)]">
                      {asset.vulnerability.summary}
                      {explanations?.[asset.id] ? (
                        <p className="mt-1 italic">What this means: {explanations[asset.id]}</p>
                      ) : null}
                      {asset.negotiated_group ? (
                        <p className="mt-1">Negotiated: {asset.negotiated_group}</p>
                      ) : null}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
