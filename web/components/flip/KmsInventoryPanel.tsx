"use client";

import { useCallback, useEffect, useState } from "react";

import { postTenantJson } from "@/lib/tenant-api";

type KmsRow = {
  host: string;
  algorithm: string;
  label: string;
  source: string;
};

type KmsPullResponse = {
  document?: {
    components?: Array<{
      name?: string;
      properties?: Array<{ name: string; value: string }>;
    }>;
  };
};

export default function KmsInventoryPanel({ apiKey }: { apiKey: string }) {
  const [rows, setRows] = useState<KmsRow[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await postTenantJson<KmsPullResponse>("/pqc/cbom/pull/kms-aws", apiKey, {});
      const components = res.document?.components ?? [];
      setRows(
        components.map((c) => ({
          host: c.properties?.find((p) => p.name === "qtangl:host")?.value ?? c.name ?? "kms",
          algorithm: "kms",
          label: c.name ?? "KMS key",
          source: "kms-aws",
        }))
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "KMS pull unavailable");
    }
  }, [apiKey]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  return (
    <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] p-4">
      <p className="text-sm font-medium text-white">KMS inventory</p>
      {message && <p className="text-xs text-[var(--muted)]">{message}</p>}
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">No KMS keys ingested yet. Configure AWS integration and scheduled pull.</p>
      ) : (
        <ul className="max-h-48 space-y-1 overflow-auto text-xs text-[var(--color-gray-300)]">
          {rows.slice(0, 30).map((r, i) => (
            <li key={i}>
              {r.label} · {r.host}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
