"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function MsspPortfolioPanel({
  rollup,
  childTenants,
}: {
  rollup?: { overallReadiness: number; byBusinessUnit: Record<string, number> } | null;
  childTenants?: Array<{ tenantId: string; tenantName: string; readiness?: number }>;
}) {
  if (!rollup && !(childTenants?.length ?? 0)) {
    return (
      <Card tone="ghost">
        <p className="text-sm text-[var(--color-gray-400)]">
          Portfolio view appears when your organization manages multiple customer tenants (MSSP mode).
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rollup ? (
        <Card tone="panel">
          <Eyebrow>Portfolio rollup</Eyebrow>
          <p className="mt-2 text-3xl font-semibold text-white">{rollup.overallReadiness}</p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(rollup.byBusinessUnit).map(([unit, score]) => (
              <div key={unit}>
                <dt className="text-xs uppercase text-[var(--color-gray-500)]">{unit}</dt>
                <dd className="text-sm text-white">{score}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}
      {(childTenants?.length ?? 0) > 0 ? (
        <Card tone="panel">
          <Eyebrow>Customer tenants</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm">
            {childTenants!.map((child) => (
              <li
                key={child.tenantId}
                className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2"
              >
                <span className="text-white">{child.tenantName}</span>
                <span className="text-[var(--color-gray-400)]">{child.readiness ?? "—"}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
