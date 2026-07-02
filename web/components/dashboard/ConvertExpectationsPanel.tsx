"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const EFFORT_BANDS = [
  {
    category: "TLS certificate rotation",
    effort: "Days",
    note: "Coordinate with PKI team; re-scan to verify post-quantum readiness.",
  },
  {
    category: "JWKS / API signing keys",
    effort: "1–2 weeks",
    note: "Inventory dependents, staged rollout, verify-fix on critical endpoints.",
  },
  {
    category: "HSM / KMS migration",
    effort: "Months",
    note: "Vendor roadmap alignment; program board tracks waves and owners.",
  },
  {
    category: "Application-layer crypto",
    effort: "Varies",
    note: "Prioritize by Mosca HNDL score and exposure in latest scan backlog.",
  },
] as const;

export default function ConvertExpectationsPanel({
  maturityStage,
  marketing = false,
}: {
  maturityStage?: number;
  marketing?: boolean;
}) {
  if (!marketing && maturityStage !== undefined && maturityStage < 2) {
    return null;
  }

  return (
    <Card tone="panel">
      <Eyebrow>What to expect — Convert path</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Typical effort bands for quantum-vulnerable findings. Convert adds verify-fix loops, program
        tracking, and orchestration at scale.
      </p>
      <ul className="mt-4 space-y-3">
        {EFFORT_BANDS.map((row) => (
          <li key={row.category} className="rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-sm">
            <p className="font-medium text-white">
              {row.category} · <span className="text-sky-300">{row.effort}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-gray-500)]">{row.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-[var(--color-gray-500)]">
        At maturity stage 3 (Monitored), next step is verify-fix on a critical finding → stage 4
        Converting. Contact sales for Convert tier orchestration.
      </p>
    </Card>
  );
}
