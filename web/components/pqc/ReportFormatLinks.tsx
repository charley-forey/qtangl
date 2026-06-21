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
  pdf: "Full PDF",
  cbom: "CBOM",
  json: "JSON",
  csv: "CSV",
  bundle: "Evidence bundle (ZIP)",
  executive: "Executive PDF (4pp)",
  board: "Board PDF (2pp)",
  auditor: "Auditor annex PDF",
};

export const FORMAT_DESCRIPTIONS: Record<PqcReportFormat, string> = {
  pdf: "Complete technical report: inventory, backlog, migration roadmap, and compliance.",
  cbom: "CycloneDX 1.6 cryptographic bill of materials for GRC and procurement.",
  json: "Machine-readable report payload for integrations and automation.",
  csv: "Spreadsheet-friendly remediation backlog export.",
  bundle: "All PDF variants, CBOM, JSON, CSV, methodology, and signature in one ZIP.",
  executive: "Four-page CISO summary with KPIs, priorities, and verify QR.",
  board: "Two-page board brief with readiness gauge, top decisions, and exposure range.",
  auditor: "Chain-of-custody annex with scope, control mapping, glossary, and references.",
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
