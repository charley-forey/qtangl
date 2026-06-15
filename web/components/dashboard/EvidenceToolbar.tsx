"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function EvidenceToolbar({
  scanId,
  reportUrlForScan,
}: {
  scanId: string | null;
  reportUrlForScan: (scanId: string, format: "pdf" | "board" | "auditor" | "bundle") => string;
}) {
  if (!scanId) {
    return null;
  }

  const formats: Array<{ format: "pdf" | "board" | "auditor" | "bundle"; label: string }> = [
    { format: "pdf", label: "PDF" },
    { format: "board", label: "Board" },
    { format: "auditor", label: "Auditor" },
    { format: "bundle", label: "Evidence bundle" },
  ];

  return (
    <div
      id="evidence-toolbar"
      className="sticky bottom-4 z-20 rounded-2xl border border-[var(--border-strong)] bg-black/90 px-4 py-3 shadow-lg backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
          Evidence exports
        </span>
        <span className="font-mono text-xs text-[var(--color-gray-500)]">{scanId}</span>
        {formats.map(({ format, label }) => (
          <a
            key={format}
            href={reportUrlForScan(scanId, format)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-white hover:bg-white/10"
          >
            {label}
          </a>
        ))}
        <a
          href="/verify"
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--color-gray-300)]"
        >
          Verify
        </a>
      </div>
    </div>
  );
}
