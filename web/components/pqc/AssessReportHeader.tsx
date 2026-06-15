"use client";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import type { PqcScanResponse, ReportAvailabilityResponse } from "@/lib/pqc";
import { pqcReportDownloadUrl } from "@/lib/pqc";

import ReportFormatLinks, { shortScanId } from "./ReportFormatLinks";

type AssessReportHeaderProps = {
  scanResponse: PqcScanResponse;
  reportStatus: "ready" | "checking" | "unavailable";
  reportAvailability: ReportAvailabilityResponse | null;
  onError: (message: string) => void;
  onOpenDrawer: () => void;
};

export default function AssessReportHeader({
  scanResponse,
  reportStatus,
  reportAvailability,
  onError,
  onOpenDrawer,
}: AssessReportHeaderProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">Executive report pack</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                reportStatus === "ready"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : reportStatus === "checking"
                    ? "bg-white/10 text-[var(--color-gray-400)]"
                    : "bg-amber-500/15 text-amber-200"
              }`}
            >
              {reportStatus === "checking"
                ? "Checking"
                : reportStatus === "ready"
                  ? "Ready"
                  : "Unavailable"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">
            {scanResponse.readinessBand ??
              scanResponse.scoreboard.qtangl.readiness_band ??
              "Q-Day readiness"}
          </p>
          <p className="mt-1 font-mono text-[10px] text-[var(--color-gray-500)]" title={scanResponse.scanId}>
            {shortScanId(scanResponse.scanId)}
          </p>
        </div>
        <a
          href={reportStatus === "ready" ? pqcReportDownloadUrl(scanResponse.scanId, "pdf") : "#"}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            if (reportStatus !== "ready") {
              event.preventDefault();
              onError(
                `Report unavailable${reportAvailability?.missingReason ? ` (${reportAvailability.missingReason})` : ""}.`
              );
              return;
            }
            trackEvent("pqc_report_downloaded", { format: "pdf", scanId: scanResponse.scanId });
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black transition hover:bg-neutral-100 sm:mt-0"
        >
          Download PDF
        </a>
      </div>
      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <ReportFormatLinks
            scanId={scanResponse.scanId}
            reportStatus={reportStatus}
            formats={["cbom", "json", "csv", "bundle", "executive", "board", "auditor"]}
            variant="inline"
            onUnavailable={onError}
          />
          <a
            href={`/verify?scanId=${encodeURIComponent(scanResponse.scanId)}`}
            className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-black/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-gray-300)] transition hover:border-white/20 hover:text-white"
          >
            Verify
          </a>
          <Button variant="secondary" size="sm" onClick={onOpenDrawer}>
            All formats
          </Button>
        </div>
      </div>
    </div>
  );
}
