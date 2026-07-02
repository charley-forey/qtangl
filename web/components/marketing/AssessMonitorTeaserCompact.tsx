import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { monitorPreviewDiff } from "@/lib/copy/readiness-demos";

export default function AssessMonitorTeaserCompact() {
  const delta = monitorPreviewDiff.readinessDelta ?? 0;

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>What Monitor adds</Eyebrow>
      <h3 className="mt-3 text-lg font-semibold text-white">Track drift after your baseline</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        Assess is a one-session snapshot. Monitor schedules re-scans, detects drift, and alerts when new
        quantum-vulnerable endpoints appear.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Readiness delta</dt>
          <dd className={delta < 0 ? "text-red-300" : "text-emerald-300"}>
            {delta > 0 ? `+${delta}` : delta} ({monitorPreviewDiff.previousReadinessScore} →{" "}
            {monitorPreviewDiff.currentReadinessScore})
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">New Q-vulnerable</dt>
          <dd className="text-white">{monitorPreviewDiff.newQuantumVulnerableCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Certs expiring</dt>
          <dd className="text-white">{monitorPreviewDiff.certExpiringCount ?? 0}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-[var(--color-gray-500)]">{monitorPreviewDiff.summary}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/monitor" variant="secondary">
          See Monitor preview
        </Button>
        <Link href="/monitor" className="text-sm text-[var(--color-gray-400)] underline hover:text-white">
          Drift charts & alert previews →
        </Link>
      </div>
    </Card>
  );
}
