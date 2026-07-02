"use client";

import dynamic from "next/dynamic";

import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const MonitorRemediationVelocity = dynamic(
  () => import("@/components/marketing/MonitorRemediationVelocity"),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded bg-white/5" /> }
);

export default function MonitorRemediationSection() {
  const { scenario } = useMonitorScenario();
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Remediation velocity</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Open vs closed findings over 8 weeks of scheduled monitoring.
      </p>
      <div className="mt-4">
        <MonitorRemediationVelocity data={scenario.remediationVelocity} />
      </div>
    </Card>
  );
}
