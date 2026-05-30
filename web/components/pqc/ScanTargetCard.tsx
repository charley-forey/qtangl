"use client";

import type { ScanTarget } from "@/lib/pqc";
import { PqcChip } from "./ui";

export default function ScanTargetCard({
  target,
  authorized,
  onAuthorizedChange,
  customDomain,
  onCustomDomainChange,
}: {
  target: ScanTarget;
  authorized: boolean;
  onAuthorizedChange: (value: boolean) => void;
  customDomain: string;
  onCustomDomainChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <PqcChip tone="warn">{target.persona}</PqcChip>
        <PqcChip>{target.organization}</PqcChip>
      </div>
      <p className="text-sm text-[var(--color-gray-300)]">{target.mandate}</p>
      <label className="block text-xs text-[var(--color-gray-400)]">
        Scan target domain (live mode)
        <input
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-black/20 px-3 py-2 text-sm text-white"
          value={customDomain}
          onChange={(event) => onCustomDomainChange(event.target.value)}
          placeholder={target.domain}
        />
      </label>
      <label className="flex items-start gap-2 rounded-lg border border-[var(--color-border)] bg-black/20 p-3 text-xs text-[var(--color-gray-300)]">
        <input
          type="checkbox"
          checked={authorized}
          onChange={(event) => onAuthorizedChange(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          <strong className="text-white">Authorization required for live scans.</strong> I confirm I
          own this target or have written permission to scan it. Qtangl blocks private and metadata
          addresses; live mode is an inventory aid, not a formal penetration test or audit.
        </span>
      </label>
    </div>
  );
}
