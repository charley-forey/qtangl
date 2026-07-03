"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type TransparencyEntry = {
  seq: number;
  contentHash: string;
  entryHash: string;
  scanId?: string | null;
  createdAt?: string | null;
};

type TransparencyResponse = {
  rootHash?: string | null;
  entries: TransparencyEntry[];
  total: number;
  verifyInstructions: string;
};

function short(hash: string): string {
  return hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
}

export default function TransparencyLogViewer({ limit = 25 }: { limit?: number }) {
  const [data, setData] = useState<TransparencyResponse | null>(null);

  useEffect(() => {
    if (!ccFlags.transparency) return;
    void fetchDashboardJson<TransparencyResponse>(`/tenant/evidence/transparency?limit=${limit}`)
      .then((result) => {
        setData(result);
        trackDashboardEvent({ event: "cc_transparency_viewed", properties: { total: result.total } });
      })
      .catch(() => setData(null));
  }, [limit]);

  if (!ccFlags.transparency || !data) return null;

  return (
    <Card tone="panel" className="space-y-3">
      <Eyebrow>Evidence transparency log</Eyebrow>
      <p className="text-[10px] text-[var(--color-gray-500)]">
        Append-only hash chain of signed evidence. This confirms report integrity and signing — not complete estate
        coverage.
      </p>
      {data.rootHash ? (
        <p className="break-all rounded-lg bg-black/40 px-3 py-2 font-mono text-[10px] text-sky-300">
          root: {short(data.rootHash)}
        </p>
      ) : null}
      <div className="max-h-56 overflow-y-auto">
        <table className="min-w-full text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">
            <tr>
              <th className="pb-1 pr-3">Seq</th>
              <th className="pb-1 pr-3">Entry hash</th>
              <th className="pb-1 pr-3">Scan</th>
              <th className="pb-1">When</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[var(--color-gray-400)]">
            {data.entries.map((entry) => (
              <tr key={entry.seq} className="border-t border-[var(--border-subtle)]">
                <td className="py-1 pr-3">{entry.seq}</td>
                <td className="py-1 pr-3">{short(entry.entryHash)}</td>
                <td className="py-1 pr-3">{entry.scanId ? short(entry.scanId) : "—"}</td>
                <td className="py-1">{entry.createdAt ? entry.createdAt.slice(0, 10) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-[var(--color-gray-500)]">{data.verifyInstructions}</p>
    </Card>
  );
}
