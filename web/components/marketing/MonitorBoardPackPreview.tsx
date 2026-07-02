"use client";

import ExecutiveDigestCard from "@/components/dashboard/ExecutiveDigestCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";

export default function MonitorBoardPackPreview() {
  const { scenario } = useMonitorScenario();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ExecutiveDigestCard digest={scenario.digest} />
      <Card tone="feature" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Board pack export</Eyebrow>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          QBR-ready PDF with readiness trend, open critical items, framework mapping, and signed
          verify link — generated from your latest completed scan.
        </p>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--color-gray-500)]">Format</dt>
            <dd className="text-white">PDF (board layout)</dd>
          </div>
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--color-gray-500)]">Readiness</dt>
            <dd className="text-white">{scenario.readinessScore}</dd>
          </div>
          <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--color-gray-500)]">Verify URL</dt>
            <dd className="truncate font-mono text-xs text-sky-300">
              qtangl.com/verify?scanId=…
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[var(--color-gray-500)]">
          Illustrative preview — export real board packs from your tenant dashboard.
        </p>
        <div className="mt-6">
          <Button href="/dashboard" variant="secondary" size="sm">
            Export from dashboard →
          </Button>
        </div>
      </Card>
    </div>
  );
}
