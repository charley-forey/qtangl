"use client";

import Button from "@/components/ui/Button";
import { getQtanglHeaders } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { pqcReportUrl } from "@/lib/pqc";
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

  async function download(format: "json" | "csv" | "cbom" | "pdf") {
    const url = pqcReportUrl(scan!.scanId, format);
    const response = await fetch(url, { headers: getQtanglHeaders() });
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `qtangl-pqc-report.${format === "pdf" ? "pdf" : format === "csv" ? "csv" : "json"}`;
    link.click();
    trackEvent("pqc_report_downloaded", { format, scanId: scan!.scanId });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-4">
      <div className="h-full w-full max-w-lg overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Migration report</h3>
          <button type="button" onClick={onClose} className="text-sm text-[var(--color-gray-400)]">
            Close
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["json", "csv", "cbom", "pdf"] as const).map((format) => (
            <Button key={format} variant="secondary" onClick={() => download(format)}>
              Download {format.toUpperCase()}
            </Button>
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
