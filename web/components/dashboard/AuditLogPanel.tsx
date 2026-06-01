"use client";

import { useEffect, useState } from "react";

import { fetchTenantJson } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";

type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  resourceId?: string;
  createdAt?: string;
};

export default function AuditLogPanel({ apiKey }: { apiKey: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    fetchTenantJson<{ entries: AuditEntry[] }>("/tenant/audit?limit=20", apiKey)
      .then((payload) => setEntries(payload.entries))
      .catch(() => setEntries([]));
  }, [apiKey]);

  if (!entries.length) {
    return <p className="text-sm text-[var(--muted)]">No audit entries yet.</p>;
  }

  return (
    <ul className="space-y-2 text-xs text-[var(--color-gray-400)]">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
          <span className="text-white">{entry.action}</span>
          <span>{entry.createdAt ? formatUtcDateTime(entry.createdAt) : "—"}</span>
        </li>
      ))}
    </ul>
  );
}
