"use client";

import { switchActiveTenant, type DashboardSession } from "@/lib/dashboard-bff";

function bandDot(band?: string | null) {
  const normalized = String(band ?? "").toLowerCase();
  if (["leading", "on-track", "strong"].includes(normalized)) return "bg-emerald-400";
  if (["lagging", "critical", "high-risk"].includes(normalized)) return "bg-red-400";
  if (normalized) return "bg-amber-300";
  return "bg-gray-500";
}

export default function TenantSwitcher({
  session,
  membershipHealth = [],
  onSwitched,
}: {
  session: DashboardSession;
  membershipHealth?: Array<{ tenantId: string; latestReadinessBand?: string | null }>;
  onSwitched: (next: DashboardSession | null) => void;
}) {
  const memberships = session.memberships ?? [];
  if (memberships.length <= 1) {
    return null;
  }

  const healthByTenant = new Map(membershipHealth.map((row) => [row.tenantId, row.latestReadinessBand]));

  return (
    <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
      Organization
      <select
        className="rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-xs text-white"
        value={session.tenantId}
        onChange={async (event) => {
          const next = await switchActiveTenant(event.target.value);
          onSwitched(next);
        }}
      >
        {memberships.map((m) => (
          <option key={m.tenantId} value={m.tenantId}>
            {m.tenantName} ({m.role})
          </option>
        ))}
      </select>
      <span className="flex gap-1" aria-hidden>
        {memberships.map((m) => (
          <span
            key={m.tenantId}
            className={`inline-block h-2 w-2 rounded-full ${bandDot(healthByTenant.get(m.tenantId))}`}
            title={healthByTenant.get(m.tenantId) ?? "unknown"}
          />
        ))}
      </span>
    </label>
  );
}
