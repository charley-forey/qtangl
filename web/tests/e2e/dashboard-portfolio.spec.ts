import { test, expect } from "@playwright/test";

import {
  mockDashboardEvents,
  mockDashboardSession,
  mockDashboardTenantRoutes,
} from "./helpers/dashboard-bff-mocks";

const summaryPayload = {
  me: {
    tenantId: "parent-mssp",
    persistenceEnabled: true,
    role: "admin",
    entitlements: { tier: "enterprise", maxScansPerMonth: 5000, maxSchedules: 100 },
    scanCount: 5,
    scansThisMonth: 5,
    latestReadinessScore: 80,
    schedulerEnabled: true,
  },
  kpis: { latestReadiness: 80, latestBand: "on-track", openCritical: 0, scansThisMonth: 5 },
  trend: [{ date: "2026-06-01", score: 80, scanId: "scan-1", band: "on-track" }],
  digest: { headline: "Portfolio readiness is 80.", wins: [], risks: [], nextWeekFocus: [], narrative: "MSSP" },
  commandCenter: { businessUnits: { "Demo Bank": 78, "Demo Insurer": 82 }, highRiskTargets: [] },
  alerts: [],
  recentScans: [
    {
      scanId: "scan-1",
      status: "done",
      readinessScore: 80,
      readinessBand: "on-track",
      createdAt: "2026-06-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    },
  ],
  schedulesSummary: { active: 2 },
  health: { schedulerEnabled: true, lastScanAt: "2026-06-01T00:00:00Z" },
  latestScanDetail: { scanId: "scan-1", readinessScore: 80 },
  forecast: { projected: 82, current: 80 },
  remediationVelocity: { closedCount: 2, openCount: 3, completionRatePct: 40 },
  sloMetrics: { scanSuccessRatePct: 100, reportAvailabilityPct: 100, sampleSize: 5, targetSloPct: 99 },
  integrationsSummary: { jiraConfigured: false, webhookConfigured: false },
  layoutDefaults: { persona: "operator", pinned: ["kpi"], hidden: [] },
  membershipHealth: [{ tenantId: "child-1", latestReadinessScore: 78, latestReadinessBand: "on-track" }],
  portfolioSummary: { childrenCount: 2 },
};

const portfolioTabPayload = {
  children: [
    {
      childTenantId: "child-1",
      childTenantName: "Demo Bank",
      label: "Demo Bank",
      latestReadiness: 78,
      openAlerts: 1,
      remediationCompletionPct: 40,
      activeSchedules: 1,
      lastScanAt: "2026-06-01T00:00:00Z",
    },
    {
      childTenantId: "child-2",
      childTenantName: "Demo Insurer",
      label: "Demo Insurer",
      latestReadiness: 82,
      openAlerts: 0,
      remediationCompletionPct: 55,
      activeSchedules: 1,
      lastScanAt: "2026-06-02T00:00:00Z",
    },
  ],
  aggregateReadiness: 80,
  customersBelowThreshold: 0,
  atRiskCount: 0,
  totalOpenAlerts: 1,
};

test.describe("Dashboard MSSP portfolio (mocked BFF)", () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardSession(page, {
      email: "admin@mssp.com",
      tenantId: "parent-mssp",
      tenantName: "Demo MSSP",
      role: "admin",
      userId: "user-mssp",
      capabilities: { canAdmin: true, canWrite: true, canViewCompliance: true, canManageKeys: true, canInvite: true },
    });
    await mockDashboardEvents(page);
    await mockDashboardTenantRoutes(page, {
      summary: summaryPayload,
      settings: { orgType: "mssp" },
      tabRoutes: { portfolio: portfolioTabPayload },
    });
  });

  test("portfolio tab shows customer tenants", async ({ page }) => {
    await page.goto("/command-center?tab=portfolio");
    await expect(page.getByText("Customer tenants")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("cell", { name: "Demo Bank" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Demo Insurer" })).toBeVisible();
  });
});
