"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import { formatUtcDateTime } from "@/lib/format";

export default function MonitorEvidenceFreshness() {
  const { scenario } = useMonitorScenario();
  const { evidenceFreshness } = scenario;

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Evidence freshness</Eyebrow>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-gray-500)]">Last signed report</dt>
          <dd className="text-white">{evidenceFreshness.lastSignedReport}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-gray-500)]">Verify link</dt>
          <dd className={evidenceFreshness.verifyActive ? "text-emerald-300" : "text-amber-300"}>
            {evidenceFreshness.verifyActive ? "Active" : "Expired"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-gray-500)]">Upload retention</dt>
          <dd className="text-white">{evidenceFreshness.vaultRetention}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--color-gray-500)]">Next scheduled scan</dt>
          <dd className="text-white">{formatUtcDateTime(scenario.nextRun)}</dd>
        </div>
      </dl>
    </Card>
  );
}
