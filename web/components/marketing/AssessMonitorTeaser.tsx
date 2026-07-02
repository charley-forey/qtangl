"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import { monitorPreviewDiff, monitorPreviewTrend } from "@/lib/copy/readiness-demos";

export default function AssessMonitorTeaser() {
  return (
    <div className="space-y-4">
      <div className="content-reading">
        <Eyebrow>What Monitor adds</Eyebrow>
        <h2 className="heading-section mt-4">Track drift after your baseline</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
          Assess is a one-session snapshot. Monitor schedules re-scans, detects drift, and alerts your team
          when new quantum-vulnerable endpoints appear.
        </p>
      </div>
      <ProductModeBanner mode="preview" />
      <Card tone="panel" className="rounded-[var(--radius-xl)] p-6">
        <ScanDiffPanel diff={monitorPreviewDiff} />
        <div className="mt-6">
          <ReadinessTrend points={monitorPreviewTrend} />
        </div>
      </Card>
    </div>
  );
}
