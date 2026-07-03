"use client";

import Link from "next/link";

import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  monitorPreviewDiff,
  monitorPreviewSchedule,
  monitorPreviewTrend,
} from "@/lib/copy/readiness-demos";
import { formatUtcDateTime } from "@/lib/format";

export default function MonitorPreview() {
  return (
    <div className="space-y-6">
      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Live preview — Monitor tier</Eyebrow>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
          Sample drift from a weekly re-scan. Connect your tenant key on the{" "}
          <Link href="/command-center" className="text-white underline underline-offset-4">
            dashboard
          </Link>{" "}
          for real data.
        </p>
        <div className="mt-6">
          <ScanDiffPanel diff={monitorPreviewDiff} />
        </div>
      </Card>

      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Readiness trend</Eyebrow>
        <div className="mt-4">
          <ReadinessTrend points={[...monitorPreviewTrend]} />
        </div>
      </Card>

      <Card tone="feature" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Scheduled monitoring</Eyebrow>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Target</dt>
            <dd className="mt-1 text-sm text-white">{monitorPreviewSchedule.target}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Cadence</dt>
            <dd className="mt-1 text-sm text-white">{monitorPreviewSchedule.cadence}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Next run</dt>
            <dd className="mt-1 text-sm text-white">{formatUtcDateTime(monitorPreviewSchedule.nextRun)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Alert on</dt>
            <dd className="mt-1 text-sm text-white">{monitorPreviewSchedule.alertThreshold}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
