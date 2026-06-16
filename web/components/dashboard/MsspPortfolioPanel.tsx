"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import type { PortfolioTabBundle } from "@/lib/dashboard-state";
import { switchActiveTenant } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

export default function MsspPortfolioPanel({
  bundle,
  onSwitchTenant,
}: {
  bundle?: PortfolioTabBundle | null;
  onSwitchTenant?: () => void;
}) {
  const children = bundle?.children ?? [];
  const rollup = bundle?.rollup as { overallReadiness?: number; byBusinessUnit?: Record<string, number> } | null;

  if (!bundle && children.length === 0) {
    return (
      <Card tone="ghost">
        <p className="text-sm text-[var(--color-gray-400)]">
          Portfolio view appears when your organization manages multiple customer tenants (MSSP mode).
        </p>
      </Card>
    );
  }

  const businessUnits: Record<string, number> = {};
  for (const child of children) {
    const name = String(child.childTenantName ?? child.tenantName ?? child.childTenantId ?? "customer");
    const score = Number(child.latestReadiness ?? child.latestReadinessScore ?? 0);
    if (name) businessUnits[name] = score;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card tone="panel">
          <Eyebrow>Aggregate readiness</Eyebrow>
          <p className="mt-2 text-3xl font-semibold text-white">{bundle?.aggregateReadiness ?? rollup?.overallReadiness ?? "—"}</p>
        </Card>
        <Card tone="panel">
          <Eyebrow>Below threshold</Eyebrow>
          <p className="mt-2 text-3xl font-semibold text-amber-200">{bundle?.customersBelowThreshold ?? 0}</p>
        </Card>
        <Card tone="panel">
          <Eyebrow>At risk</Eyebrow>
          <p className="mt-2 text-3xl font-semibold text-red-200">{bundle?.atRiskCount ?? 0}</p>
        </Card>
      </div>

      {Object.keys(businessUnits).length > 0 ? (
        <BusinessUnitHeatmap businessUnits={businessUnits} />
      ) : null}

      {children.length > 0 ? (
        <Card tone="panel">
          <Eyebrow>Customer tenants</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm">
            {children.map((child) => {
              const tenantId = String(child.childTenantId ?? child.tenantId ?? "");
              const name = String(child.childTenantName ?? child.tenantName ?? tenantId);
              const score = child.latestReadiness ?? child.latestReadinessScore;
              const band = String(child.latestBand ?? "");
              return (
                <li key={tenantId}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left hover:bg-white/5"
                    onClick={async () => {
                      await switchActiveTenant(tenantId);
                      trackDashboardEvent("dashboard_portfolio_click", { tenantId });
                      onSwitchTenant?.();
                    }}
                  >
                    <span className="text-white">{name}</span>
                    <span className="text-[var(--color-gray-400)]">
                      {score != null ? String(score) : "—"} {band ? `· ${band}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
