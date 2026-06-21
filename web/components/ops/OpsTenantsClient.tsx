"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import OpsShell from "@/components/ops/OpsShell";
import OpsProvisionForm from "@/components/ops/OpsProvisionForm";
import { formatUtcDateTime } from "@/lib/format";

type TenantRow = {
  tenantId: string;
  name: string;
  tier?: string;
  createdAt?: string;
  memberCount?: number;
  scansThisMonth?: number;
  lastScanAt?: string | null;
  scheduleCount?: number;
  assessPaid?: boolean;
  orgType?: string;
};

function tenantsToCsv(rows: TenantRow[]): string {
  const header = [
    "tenantId",
    "name",
    "tier",
    "memberCount",
    "scansThisMonth",
    "scheduleCount",
    "assessPaid",
    "orgType",
    "lastScanAt",
    "createdAt",
  ];
  const escape = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? "" : String(value);
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.tenantId,
        row.name,
        row.tier ?? "",
        row.memberCount ?? 0,
        row.scansThisMonth ?? 0,
        row.scheduleCount ?? 0,
        row.assessPaid ?? false,
        row.orgType ?? "",
        row.lastScanAt ?? "",
        row.createdAt ?? "",
      ]
        .map(escape)
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export default function OpsTenantsClient() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showProvision, setShowProvision] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (tier) params.set("tier", tier);
    params.set("limit", "100");
    const response = await fetch(`/api/ops/tenants?${params}`);
    if (!response.ok) {
      setError("Unable to load tenants.");
      return;
    }
    const payload = await response.json();
    setTenants(payload.tenants ?? []);
    setTotal(payload.total ?? 0);
    setError(null);
  }, [search, tier]);

  useEffect(() => {
    void load();
  }, [load]);

  function downloadCsv() {
    if (tenants.length === 0) return;
    const blob = new Blob([tenantsToCsv(tenants)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `qtangl-tenants-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OpsShell title="Tenants" subtitle={`${total} workspace(s) on platform`}>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
          placeholder="Search name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
        >
          <option value="">All tiers</option>
          <option value="free">free</option>
          <option value="monitor">monitor</option>
          <option value="convert">convert</option>
          <option value="enterprise">enterprise</option>
        </select>
        <button type="button" className="text-sm underline" onClick={() => void load()}>
          Refresh
        </button>
        <button type="button" className="text-sm underline" onClick={() => setShowProvision((v) => !v)}>
          {showProvision ? "Hide provision form" : "Provision tenant"}
        </button>
        {tenants.length > 0 ? (
          <button type="button" className="text-sm underline" onClick={downloadCsv}>
            Export CSV
          </button>
        ) : null}
      </div>

      {showProvision ? (
        <OpsProvisionForm
          onCreated={() => {
            setShowProvision(false);
            void load();
          }}
        />
      ) : null}

      <Card tone="panel">
        <Eyebrow>Workspaces</Eyebrow>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--color-gray-500)]">
              <tr>
                <th className="pb-2 pr-4">Tenant</th>
                <th className="pb-2 pr-4">Tier</th>
                <th className="pb-2 pr-4">Members</th>
                <th className="pb-2 pr-4">Scans/mo</th>
                <th className="pb-2 pr-4">Schedules</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              {tenants.map((row) => (
                <tr key={row.tenantId} className="border-t border-[var(--border-subtle)]">
                  <td className="py-3 pr-4">
                    <Link href={`/ops/tenants/${encodeURIComponent(row.tenantId)}`} className="underline">
                      {row.name}
                    </Link>
                    <p className="font-mono text-xs text-[var(--color-gray-500)]">{row.tenantId}</p>
                  </td>
                  <td className="py-3 pr-4">{row.tier ?? "—"}</td>
                  <td className="py-3 pr-4">{row.memberCount ?? 0}</td>
                  <td className="py-3 pr-4">{row.scansThisMonth ?? 0}</td>
                  <td className="py-3 pr-4">{row.scheduleCount ?? 0}</td>
                  <td className="py-3">{row.createdAt ? formatUtcDateTime(row.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </OpsShell>
  );
}
