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
      <div className="grid gap-4 sm:grid-cols-4">
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
        <Card tone="panel">
          <Eyebrow>Open alerts</Eyebrow>
          <p className="mt-2 text-3xl font-semibold text-sky-200">{bundle?.totalOpenAlerts ?? 0}</p>
        </Card>
      </div>

      {Object.keys(businessUnits).length > 0 ? (
        <BusinessUnitHeatmap businessUnits={businessUnits} />
      ) : null}

      {children.length > 0 ? (
        <Card tone="panel">
          <Eyebrow>Customer tenants</Eyebrow>
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                <tr>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Readiness</th>
                  <th className="pb-2 pr-4">Open alerts</th>
                  <th className="pb-2 pr-4">Remediation %</th>
                  <th className="pb-2 pr-4">Last scan</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-gray-300)]">
                {children.map((child) => {
                  const tenantId = String(child.childTenantId ?? child.tenantId ?? "");
                  const name = String(child.childTenantName ?? child.tenantName ?? tenantId);
                  const score = child.latestReadiness ?? child.latestReadinessScore;
                  const band = String(child.latestBand ?? "");
                  const openAlerts = Number(child.openAlerts ?? 0);
                  const velocity = child.remediationVelocityPct;
                  const lastScanAge = child.lastScanAgeDays;
                  return (
                    <tr key={tenantId} className="border-t border-[var(--border-subtle)]">
                      <td className="py-2 pr-4 text-white">{name}</td>
                      <td className="py-2 pr-4">
                        {score != null ? String(score) : "—"} {band ? `· ${band}` : ""}
                      </td>
                      <td className="py-2 pr-4">{openAlerts}</td>
                      <td className="py-2 pr-4">{velocity != null ? `${velocity}%` : "—"}</td>
                      <td className="py-2 pr-4">{lastScanAge != null ? `${lastScanAge}d ago` : "—"}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          className="text-sky-300 underline"
                          onClick={async () => {
                            await switchActiveTenant(tenantId);
                            trackDashboardEvent("dashboard_portfolio_click", { tenantId });
                            onSwitchTenant?.();
                          }}
                        >
                          Open workspace
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-2 text-sm md:hidden">
            {children.map((child) => {
              const tenantId = String(child.childTenantId ?? child.tenantId ?? "");
              const name = String(child.childTenantName ?? child.tenantName ?? tenantId);
              const score = child.latestReadiness ?? child.latestReadinessScore;
              const band = String(child.latestBand ?? "");
              const openAlerts = Number(child.openAlerts ?? 0);
              const velocity = child.remediationVelocityPct;
              const lastScanAge = child.lastScanAgeDays;
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
                      {score != null ? String(score) : "—"} {band ? `· ${band}` : ""} · {openAlerts} alerts
                      {velocity != null ? ` · ${velocity}%` : ""}
                      {lastScanAge != null ? ` · ${lastScanAge}d` : ""}
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
