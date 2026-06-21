"use client";

import { useEffect, useState } from "react";

import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { fetchTenantJson } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";

type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  resourceId?: string;
  createdAt?: string;
};

export default function AuditLogPanel({
  apiKey,
  bffMode = false,
}: {
  apiKey: string;
  bffMode?: boolean;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const loader = bffMode
      ? fetchDashboardJson<{ entries: AuditEntry[] }>("/tenant/audit?limit=20")
      : fetchTenantJson<{ entries: AuditEntry[] }>("/tenant/audit?limit=20", apiKey);
    loader
      .then((payload) => setEntries(payload.entries))
      .catch(() => setEntries([]));
  }, [apiKey, bffMode]);

  if (!entries.length) {
    return <p className="text-sm text-[var(--muted)]">No audit entries yet.</p>;
  }

  return (
    <ul className="space-y-2 text-xs text-[var(--color-gray-400)]">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
          <span className="text-white">
            {entry.action}
            {entry.actor ? <span className="ml-2 text-[var(--color-gray-500)]">· {entry.actor}</span> : null}
          </span>
          <span>{entry.createdAt ? formatUtcDateTime(entry.createdAt) : "—"}</span>
        </li>
      ))}
    </ul>
  );
}
