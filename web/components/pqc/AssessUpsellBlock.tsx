"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ASSESS_MONITOR_CHECKOUT_ENABLED } from "@/lib/assess-config";
import { trackEvent } from "@/lib/analytics";
import { monitorPreviewDiff, monitorPreviewTrend } from "@/lib/copy/readiness-demos";
import type { PqcScanResponse } from "@/lib/pqc";
import { fetchTenantJson } from "@/lib/tenant-api";

import ReadinessTrend from "./ReadinessTrend";
import ScanDiffPanel, { type ScanDiff } from "./ScanDiffPanel";

const MONITOR_HREF = "/access?interest=Q-Day%20Monitor%20(annual)&source=assess-upsell";

type TrendPoint = {
  scanId: string;
  createdAt: string;
  readinessScore: number;
  readinessBand?: string;
};

type AssessUpsellBlockProps = {
  scan: PqcScanResponse | null;
  onRunComparisonScan: () => void;
  hidden?: boolean;
  tenantApiKey?: string | null;
};

function resolveScanDiff(scan: PqcScanResponse | null): ScanDiff {
  const live = scan?.report?.scanDiff as ScanDiff | undefined;
  return live?.previousScanId ? live : monitorPreviewDiff;
}

export default function AssessUpsellBlock({
  scan,
  onRunComparisonScan,
  hidden,
  tenantApiKey,
}: AssessUpsellBlockProps) {
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([...monitorPreviewTrend]);

  useEffect(() => {
    if (!tenantApiKey) return;
    let cancelled = false;
    async function loadTrend() {
      try {
        const payload = await fetchTenantJson<{ points?: TrendPoint[] }>(
          "/tenant/analytics/readiness-trend",
          tenantApiKey!
        );
        if (!cancelled && payload.points?.length) {
          setTrendPoints(payload.points);
        }
      } catch {
        // Keep preview trend on failure.
      }
    }
    void loadTrend();
    return () => {
      cancelled = true;
    };
  }, [tenantApiKey]);

  if (hidden) return null;
  const diff = resolveScanDiff(scan);
  const usingPreview = !scan?.report?.scanDiff || !(scan.report.scanDiff as ScanDiff).previousScanId;
  const usingPreviewTrend = !tenantApiKey || trendPoints.length <= 1;

  function handleMonitorClick() {
    trackEvent("monitor_proposed", { scanId: scan?.scanId ?? "preview" });
  }

  return (
    <div className="space-y-6" data-assess-upsell>
      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Drift since last scan</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-400)]">
          {usingPreview
            ? "Sample drift from a weekly re-scan. Run a second assessment or connect Monitor for live diffs."
            : "Changes detected versus your previous scan."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onRunComparisonScan}>
            Run comparison scan
          </Button>
        </div>
        <div className="mt-6">
          <ScanDiffPanel diff={diff} />
        </div>
      </Card>

      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Readiness trend</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-400)]">
          {usingPreviewTrend
            ? "Track score movement across scheduled re-scans with Q-Day Monitor."
            : "Live trend from your tenant workspace."}
        </p>
        <div className="mt-4">
          <ReadinessTrend points={trendPoints} />
        </div>
      </Card>

      <Card tone="feature" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Next step — Monitor</Eyebrow>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)]">
          Schedule weekly re-scans, drift alerts, and remediation tracking for your domain portfolio.
          Most teams upgrade within two weeks of their first baseline.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={MONITOR_HREF} onClick={handleMonitorClick}>
            Request Monitor pilot
          </Button>
          {ASSESS_MONITOR_CHECKOUT_ENABLED ? (
            <Button href="/access?checkout=monitor" variant="secondary" size="sm">
              Monitor checkout (beta)
            </Button>
          ) : null}
          <Button href="/monitor" variant="secondary" size="sm">
            Monitor overview
          </Button>
          <Button href="/command-center#integrations" variant="secondary" size="sm">
            Slack drift alerts
          </Button>
          <Button href="/convert" variant="secondary" size="sm">
            Convert program
          </Button>
          <Link
            href="/command-center"
            className="inline-flex h-10 items-center px-2 text-sm text-[var(--color-gray-400)] underline underline-offset-4 hover:text-white"
          >
            Connect tenant key
          </Link>
        </div>
      </Card>
    </div>
  );
}
