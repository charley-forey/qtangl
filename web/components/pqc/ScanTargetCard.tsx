"use client";

import { PUBLIC_DEMO_LIVE_HOSTS, OQS_DEMO_HOST } from "@/lib/assess-config";
import type { ScanTarget } from "@/lib/pqc";
import { PqcChip } from "./ui";

type ScanTargetCardProps = {
  target: ScanTarget;
  authorized: boolean;
  onAuthorizedChange: (value: boolean) => void;
  customDomain: string;
  onCustomDomainChange: (value: string) => void;
  useFixture: boolean;
  onApplyOqsPreset?: () => void;
};

export default function ScanTargetCard({
  target,
  authorized,
  onAuthorizedChange,
  customDomain,
  onCustomDomainChange,
  useFixture,
  onApplyOqsPreset,
}: ScanTargetCardProps) {
  if (useFixture) {
    return (
      <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex flex-wrap gap-2">
          <PqcChip tone="warn">{target.persona}</PqcChip>
          <PqcChip>{target.organization}</PqcChip>
        </div>
        <p className="text-sm text-[var(--color-gray-300)]">{target.mandate}</p>
        <p className="text-xs leading-6 text-emerald-100/90">
          Fixture target: <span className="font-medium text-white">{target.domain}</span> (fictional, offline).
          No URL entry required — switch to live scan mode if you want a real TLS handshake.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <PqcChip tone="warn">{target.persona}</PqcChip>
        <PqcChip>{target.organization}</PqcChip>
      </div>
      <p className="text-sm text-[var(--color-gray-300)]">{target.mandate}</p>
      <label className="block text-xs text-[var(--color-gray-400)]">
        Live scan target
        <input
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-black/20 px-3 py-2 text-sm text-white"
          value={customDomain}
          onChange={(event) => onCustomDomainChange(event.target.value)}
          placeholder={OQS_DEMO_HOST}
        />
      </label>
      {onApplyOqsPreset ? (
        <button
          type="button"
          onClick={onApplyOqsPreset}
          className="text-xs font-medium text-white underline underline-offset-4"
        >
          Use {OQS_DEMO_HOST} (recommended public demo)
        </button>
      ) : null}
      <p className="text-xs text-[var(--color-gray-500)]">
        Approved public demo hosts: {[...PUBLIC_DEMO_LIVE_HOSTS].join(", ")}. Other domains require{" "}
        <a href="/assess/start" className="underline text-white">
          an authorized workspace
        </a>
        .
      </p>
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
