"use client";

import { useEffect, useState } from "react";

import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { fetchTenantJson } from "@/lib/tenant-api";

type HostDrift = {
  currentCount: number;
  addedCount?: number;
  removedCount?: number;
  hasBaseline?: boolean;
  scopeKey?: string;
};

export default function HostDriftWidget({ apiKey }: { apiKey: string }) {
  const [drift, setDrift] = useState<HostDrift | null>(null);

  useEffect(() => {
    const loader =
      apiKey === "bff"
        ? fetchDashboardJson<HostDrift & { status: string }>("/tenant/discovery/host-drift")
        : fetchTenantJson<HostDrift & { status: string }>("/tenant/discovery/host-drift", apiKey);
    loader.then(setDrift).catch(() => setDrift({ currentCount: 0 }));
  }, [apiKey]);

  if (!drift) {
    return <p className="text-sm text-[var(--muted)]">Loading host drift…</p>;
  }

  return (
    <div className="rounded-2xl border border-[var(--border-strong)] bg-black/40 p-4">
      <h3 className="font-medium text-white">Host fleet drift</h3>
      <p className="mt-1 text-2xl font-semibold text-white">{drift.currentCount}</p>
      <p className="text-xs text-[var(--muted)]">Current findings</p>
      {drift.hasBaseline && (
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">
          Δ +{drift.addedCount ?? 0} / −{drift.removedCount ?? 0} since last snapshot
        </p>
      )}
    </div>
  );
}
