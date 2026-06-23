"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type Props = {
  latestScanId?: string | null;
  latestScanAt?: string | null;
  dismissed?: boolean;
  maxSchedules?: number;
  schedulesActive?: number;
  reportUrlForScan?: (scanId: string, format?: "pdf" | "board") => string;
  onOpenReport?: (scanId: string) => void;
  onDismiss?: () => void;
  onAddDomain?: () => void;
  onEnableMonitoring?: () => void;
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export default function BaselineNextSteps({
  latestScanId,
  latestScanAt,
  dismissed = false,
  maxSchedules = 0,
  schedulesActive = 0,
  reportUrlForScan,
  onOpenReport,
  onDismiss,
  onAddDomain,
  onEnableMonitoring,
}: Props) {
  if (dismissed || !latestScanId) {
    return null;
  }

  const scanTime = latestScanAt ? Date.parse(latestScanAt) : NaN;
  if (!Number.isNaN(scanTime) && Date.now() - scanTime > TWENTY_FOUR_HOURS_MS) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-sky-500/30 bg-sky-500/5">
      <div className="flex items-start justify-between gap-3">
        <Eyebrow>What happens next</Eyebrow>
        {onDismiss ? (
          <button type="button" className="text-xs text-[var(--color-gray-500)] underline" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">
        Your baseline is in scan history. Review findings, set up monitoring, or add more domains.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onOpenReport ? (
          <Button type="button" size="sm" onClick={() => onOpenReport(latestScanId)}>
            Review findings
          </Button>
        ) : null}
        {maxSchedules > 0 && schedulesActive === 0 && onEnableMonitoring ? (
          <Button type="button" variant="secondary" size="sm" onClick={onEnableMonitoring}>
            Set up monitoring
          </Button>
        ) : null}
        {onAddDomain ? (
          <Button type="button" variant="secondary" size="sm" onClick={onAddDomain}>
            Add more domains
          </Button>
        ) : null}
        {reportUrlForScan ? (
          <a
            href={reportUrlForScan(latestScanId, "pdf")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-medium text-white hover:bg-white/10"
          >
            Share PDF
          </a>
        ) : null}
        {reportUrlForScan ? (
          <a
            href={reportUrlForScan(latestScanId, "board")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-medium text-white hover:bg-white/10"
          >
            Board export
          </a>
        ) : null}
      </div>
    </Card>
  );
}
