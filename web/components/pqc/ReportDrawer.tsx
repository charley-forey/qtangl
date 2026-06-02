"use client";

import { useEffect } from "react";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { pqcReportDownloadUrl } from "@/lib/pqc";
import type { PqcScanResponse } from "@/lib/pqc";

import ReferencesPanel from "./ReferencesPanel";
import ReportFormatLinks, { shortScanId } from "./ReportFormatLinks";

const DRAWER_FORMATS = ["pdf", "cbom", "json", "csv", "bundle", "executive", "board", "auditor"] as const;

export default function ReportDrawer({
  open,
  onClose,
  scan,
  reportStatus,
  missingReason,
}: {
  open: boolean;
  onClose: () => void;
  scan: PqcScanResponse | null;
  reportStatus: "ready" | "checking" | "unavailable";
  missingReason: string | null;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !scan) return null;
  const notes = (scan.report.honestyNotes as string[] | undefined) ?? [];
  const ready = reportStatus === "ready";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close report panel"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-strong)] shadow-[-12px_0_40px_rgba(0,0,0,0.35)] sm:max-w-lg"
      >
        <header className="shrink-0 border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-label">Evidence exports</p>
              <h3 id="report-drawer-title" className="mt-1 text-lg font-semibold text-white">
                Migration report
              </h3>
              <p className="mt-2 text-xs text-[var(--color-gray-400)]">
                {scan.readinessBand ?? "Q-Day readiness"}
                {" · "}
                <span className="font-mono text-[var(--color-gray-300)]" title={scan.scanId}>
                  {shortScanId(scan.scanId)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-[10px] text-[var(--color-gray-500)]">
            {reportStatus === "checking"
              ? "Checking report availability…"
              : reportStatus === "ready"
                ? "All formats ready to download"
                : `Unavailable${missingReason ? ` (${missingReason})` : ""}`}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {reportStatus !== "ready" ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
              Report formats are not ready yet. Wait for the scan to finish or re-run the assessment.
            </p>
          ) : null}

          <a
            href={ready ? pqcReportDownloadUrl(scan.scanId, "pdf") : "#"}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              if (!ready) event.preventDefault();
              else trackEvent("pqc_report_downloaded", { format: "pdf", scanId: scan.scanId });
            }}
            className="mb-4 flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:bg-neutral-100"
          >
            Download PDF report
          </a>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            Other formats
          </p>
          <ReportFormatLinks
            scanId={scan.scanId}
            reportStatus={reportStatus}
            formats={DRAWER_FORMATS.filter((f) => f !== "pdf")}
            variant="pill"
          />

          <a
            href={`/verify?scanId=${encodeURIComponent(scan.scanId)}`}
            className="mt-4 inline-block text-xs text-[var(--color-gray-300)] underline underline-offset-4 hover:text-white"
          >
            Verify signature independently →
          </a>

          {notes.length > 0 ? (
            <ul className="mt-6 space-y-2 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-[var(--color-gray-400)]">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <ReferencesPanel />
          </div>
        </div>

        <footer className="shrink-0 border-t border-[var(--color-border)] px-5 py-3">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Done
          </Button>
        </footer>
      </div>
    </div>
  );
}
