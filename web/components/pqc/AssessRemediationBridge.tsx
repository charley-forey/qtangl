"use client";

import Link from "next/link";

import Button from "@/components/ui/Button";
import type { RemediationItem } from "@/lib/pqc";

type AssessRemediationBridgeProps = {
  items: RemediationItem[];
  scanId: string;
};

export default function AssessRemediationBridge({ items, scanId }: AssessRemediationBridgeProps) {
  const criticalCount = items.filter((item) => item.severity === "critical" || item.priority <= 2).length;
  const csvHref = `/api/pqc/report/${encodeURIComponent(scanId)}?format=csv`;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-sm font-medium text-white">Remediation → Convert bridge</p>
      <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
        Export your backlog for ticketing, assign owners in the dashboard, and re-scan to verify fixes.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button href={csvHref} variant="secondary" size="sm">
          Export backlog CSV
        </Button>
        <Button href={`/command-center?scanId=${encodeURIComponent(scanId)}#remediation`} variant="secondary" size="sm">
          Assign owner (dashboard)
        </Button>
        {criticalCount >= 3 ? (
          <Button href="/convert" variant="secondary" size="sm">
            Convert program ({criticalCount} critical)
          </Button>
        ) : null}
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-4">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[var(--color-gray-300)]">
                #{item.priority} {item.title}
              </span>
              <Link
                href={`/verify?scanId=${encodeURIComponent(scanId)}&item=${encodeURIComponent(item.id)}`}
                className="text-white underline underline-offset-4"
              >
                Re-scan to verify fix
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
