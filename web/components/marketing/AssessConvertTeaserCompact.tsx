import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertPreviewBaseline } from "@/lib/copy/readiness-demos";

export default function AssessConvertTeaserCompact() {
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>What Convert adds</Eyebrow>
      <h3 className="mt-3 text-lg font-semibold text-white">Remediation program with signed proof of fix</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        After your baseline, Convert tracks remediation waves, what-if score projections, and verify-fix loops —
        illustrative preview below.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-black/30 p-4">
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Current score</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">{convertPreviewBaseline.currentScore}</dd>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-black/30 p-4">
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Open items</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">{convertPreviewBaseline.openCount}</dd>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-black/30 p-4">
          <dt className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">In progress</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">{convertPreviewBaseline.inProgressCount}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/convert">See full Convert preview</Button>
        <Link href="/convert" className="text-sm text-[var(--color-gray-400)] underline hover:text-white">
          Interactive program simulator →
        </Link>
      </div>
    </Card>
  );
}
