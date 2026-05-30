"use client";

import { trackEvent } from "@/lib/analytics";
import { pqcReportDownloadUrl } from "@/lib/pqc";
import type { PqcScanResponse } from "@/lib/pqc";

export default function ReportDrawer({
  open,
  onClose,
  scan,
}: {
  open: boolean;
  onClose: () => void;
  scan: PqcScanResponse | null;
}) {
  if (!open || !scan) return null;
  const notes = (scan.report.honestyNotes as string[] | undefined) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
      <div className="h-full w-full max-w-lg overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Migration report</h3>
          <button type="button" onClick={onClose} className="text-sm text-[var(--color-gray-400)]">
            Close
          </button>
        </div>
        <p className="mb-4 text-xs text-[var(--color-gray-400)]">
          Scan <span className="font-mono text-white">{scan.scanId}</span>
          {scan.readinessBand ? ` · ${scan.readinessBand}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {(["pdf", "cbom", "json", "csv"] as const).map((format) => (
            <a
              key={format}
              href={pqcReportDownloadUrl(scan.scanId, format)}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("pqc_report_downloaded", { format, scanId: scan.scanId })}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.02] px-4 text-sm font-medium text-white hover:border-[var(--border-strong)] hover:bg-white/[0.05]"
            >
              Download {format.toUpperCase()}
            </a>
          ))}
        </div>
        <ul className="mt-4 space-y-2 text-xs text-[var(--color-gray-400)]">
          {notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
