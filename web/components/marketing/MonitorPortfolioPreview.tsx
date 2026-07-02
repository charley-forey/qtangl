"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";

export default function MonitorPortfolioPreview() {
  const { scenario } = useMonitorScenario();
  const children = scenario.portfolioChildren;
  const aggregate =
    children.reduce((sum, c) => sum + c.readiness, 0) / Math.max(children.length, 1);
  const atRisk = children.filter((c) => c.readiness < 60).length;
  const totalAlerts = children.reduce((sum, c) => sum + c.openAlerts, 0);

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>MSSP portfolio rollup</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Partner accounts monitor child tenants from one command center — bulk digests and schedule
        templates available on partner tier.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
          <p className="text-xs text-[var(--color-gray-500)]">Aggregate readiness</p>
          <p className="mt-2 text-2xl font-semibold text-white">{aggregate.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
          <p className="text-xs text-[var(--color-gray-500)]">Below threshold</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{atRisk}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
          <p className="text-xs text-[var(--color-gray-500)]">Open alerts</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalAlerts}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {children.map((child) => (
          <li
            key={child.name}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] px-4 py-3 text-sm"
          >
            <span className="font-medium text-white">{child.name}</span>
            <span className="text-[var(--color-gray-400)]">
              {child.readiness} · {child.openAlerts} alerts · {child.tier}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
