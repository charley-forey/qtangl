"use client";

import { trackEvent } from "@/lib/analytics";
import { pqcReportDownloadUrl } from "@/lib/pqc";

export type PqcReportFormat =
  | "json"
  | "csv"
  | "cbom"
  | "pdf"
  | "bundle"
  | "executive"
  | "board"
  | "auditor";

const FORMAT_LABELS: Record<PqcReportFormat, string> = {
  pdf: "PDF",
  cbom: "CBOM",
  json: "JSON",
  csv: "CSV",
  bundle: "Bundle",
  executive: "Executive",
  board: "Board",
  auditor: "Auditor",
};

type ReportFormatLinksProps = {
  scanId: string;
  reportStatus: "ready" | "checking" | "unavailable";
  formats: readonly PqcReportFormat[];
  variant?: "inline" | "pill";
  onUnavailable?: (message: string) => void;
};

export function shortScanId(scanId: string) {
  if (scanId.length <= 20) return scanId;
  return `${scanId.slice(0, 14)}…${scanId.slice(-6)}`;
}

export default function ReportFormatLinks({
  scanId,
  reportStatus,
  formats,
  variant = "inline",
  onUnavailable,
}: ReportFormatLinksProps) {
  const ready = reportStatus === "ready";

  function handleClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    format: string,
    label: string
  ) {
    if (!ready) {
      event.preventDefault();
      onUnavailable?.(`Format unavailable (${label}).`);
      return;
    }
    trackEvent("pqc_report_downloaded", { format, scanId });
  }

  if (variant === "pill") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {formats.map((format) => {
          const label = FORMAT_LABELS[format] ?? format;
          return (
            <a
              key={format}
              href={ready ? pqcReportDownloadUrl(scanId, format) : "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => handleClick(event, format, label)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.02] px-3 text-xs font-medium text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-50"
              aria-disabled={!ready}
            >
              {label}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {formats.map((format) => {
        const label = (FORMAT_LABELS[format] ?? format).toLowerCase();
        return (
          <a
            key={format}
            href={ready ? pqcReportDownloadUrl(scanId, format) : "#"}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => handleClick(event, format, label)}
            className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-black/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-gray-300)] transition hover:border-white/20 hover:text-white"
          >
            {FORMAT_LABELS[format] ?? format}
          </a>
        );
      })}
    </>
  );
}
