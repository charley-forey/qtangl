"use client";

import type { ScanCoverageEntry } from "@/lib/pqc";
import { PqcChip } from "./ui";

export default function ScanCoverage({ entries }: { entries: ScanCoverageEntry[] }) {
  if (!entries.length) return null;

  return (
    <div className="grid gap-2">
      {entries.map((entry) => (
        <div
          key={`${entry.host}-${entry.port}-${entry.kind}`}
          className="rounded-lg border border-[var(--color-border)] bg-black/20 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">
              {entry.kind} · {entry.host}
              {entry.port ? `:${entry.port}` : ""}
            </p>
            <PqcChip tone={entry.status === "error" ? "warn" : "neutral"}>{entry.status}</PqcChip>
          </div>
          <p className="mt-2 text-xs text-[var(--color-gray-400)]">{entry.detail}</p>
        </div>
      ))}
    </div>
  );
}
