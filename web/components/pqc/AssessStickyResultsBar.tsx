"use client";

import Button from "@/components/ui/Button";
import { trackAssessReportPrinted } from "@/lib/analytics/assess-landing";
import type { PqcScanResponse } from "@/lib/pqc";
import { pqcReportDownloadUrl } from "@/lib/pqc";
import { trackEvent } from "@/lib/analytics";
import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";

type AssessStickyResultsBarProps = {
  scan: PqcScanResponse;
  reportStatus: "ready" | "checking" | "unavailable";
  onNewAssessment: () => void;
  onGoToEvidence: () => void;
};

export default function AssessStickyResultsBar({
  scan,
  reportStatus,
  onNewAssessment,
  onGoToEvidence,
}: AssessStickyResultsBarProps) {
  const score = scan.scoreboard.qtangl.readiness_score;
  const band = scan.readinessBand ?? scan.scoreboard.qtangl.readiness_band ?? "Q-Day readiness";

  function handlePrint() {
    trackAssessReportPrinted(scan.scanId);
    window.print();
  }

  function handleNewAssessment() {
    if (window.confirm("Start a new assessment? Current results stay in this URL until you navigate away.")) {
      onNewAssessment();
    }
  }

  return (
    <div className="sticky top-[5.5rem] z-10 mb-4 rounded-xl border border-[var(--border-strong)] bg-black/90 p-3 backdrop-blur-sm lg:top-[6.5rem]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Results</p>
          <p className="text-lg font-semibold text-white">
            Readiness {score.toFixed(1)}{" "}
            <span className="text-sm font-normal text-[var(--color-gray-400)]">· {band}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={reportStatus === "ready" ? pqcReportDownloadUrl(scan.scanId, "pdf") : "#"}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              if (reportStatus === "ready") {
                trackEvent(ASSESS_EVENTS.reportDownloaded, { format: "pdf", scanId: scan.scanId });
              }
            }}
            className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-medium text-black"
          >
            Download PDF
          </a>
          <Button variant="secondary" size="sm" onClick={onGoToEvidence}>
            Evidence
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePrint} className="pqc-print-show">
            Print summary
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNewAssessment}>
            New assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
