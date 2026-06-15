"use client";

import { switchActiveTenant, type DashboardSession } from "@/lib/dashboard-bff";

export default function TenantSwitcher({
  session,
  onSwitched,
}: {
  session: DashboardSession;
  onSwitched: (next: DashboardSession | null) => void;
}) {
  const memberships = session.memberships ?? [];
  if (memberships.length <= 1) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
      Organization
      <select
        className="rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-xs text-white"
        value={session.tenantId}
        onChange={async (event) => {
          const next = await switchActiveTenant(event.target.value);
          onSwitched(next);
          window.location.reload();
        }}
      >
        {memberships.map((m) => (
          <option key={m.tenantId} value={m.tenantId}>
            {m.tenantName} ({m.role})
          </option>
        ))}
      </select>
    </label>
  );
}
