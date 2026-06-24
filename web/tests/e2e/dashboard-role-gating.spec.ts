import { test, expect } from "@playwright/test";

import { mockDashboardEvents, mockDashboardSession, mockDashboardTenantRoutes } from "./helpers/dashboard-bff-mocks";
const summaryPayload = {
  me: {
    tenantId: "tenant-test",
    persistenceEnabled: true,
    role: "viewer",
    entitlements: { tier: "enterprise", maxScansPerMonth: 100 },
    scanCount: 1,
    scansThisMonth: 1,
    latestReadinessScore: 72,
    schedulerEnabled: true,
  },
  kpis: { latestReadiness: 72, latestBand: "on-track", openCritical: 0, scansThisMonth: 1 },
  trend: [{ date: "2026-06-01", score: 72, scanId: "scan-1", band: "on-track" }],
  digest: {
    headline: "Portfolio readiness is 72.",
    wins: [],
    risks: [],
    nextWeekFocus: [],
    narrative: "Viewer narrative",
  },
  commandCenter: { businessUnits: { default: 72 }, highRiskTargets: [] },
  alerts: [],
  recentScans: [
    {
      scanId: "scan-1",
      status: "done",
      readinessScore: 72,
      readinessBand: "on-track",
      createdAt: "2026-06-01T00:00:00Z",
      updatedAt: "2026-06-01T00:00:00Z",
    },
  ],
  schedulesSummary: { active: 0 },
  health: { schedulerEnabled: true, lastScanAt: "2026-06-01T00:00:00Z" },
  latestScanDetail: { scanId: "scan-1", readinessScore: 72 },
  forecast: { projected: 74, current: 72 },
  remediationVelocity: { closedCount: 0, openCount: 1, completionRatePct: 0 },
  sloMetrics: { scanSuccessRatePct: 100, reportAvailabilityPct: 100, sampleSize: 1, targetSloPct: 99 },
  integrationsSummary: { jiraConfigured: false, webhookConfigured: false },
  layoutDefaults: { persona: "operator", pinned: ["kpi"], hidden: [] },
  membershipHealth: [],
};

test.describe("Dashboard role gating", () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardSession(page, {
      email: "viewer@test.com",
      tenantId: "tenant-test",
      tenantName: "Test Co",
      role: "viewer",
      userId: "user-viewer",
      capabilities: {
        canAdmin: false,
        canWrite: false,
        canViewCompliance: true,
        canManageKeys: false,
        canInvite: false,
      },
    });
    await mockDashboardEvents(page);
    await mockDashboardTenantRoutes(page, { summary: summaryPayload });
  });

  test("viewer sees overview and scans tabs only", async ({ page }) => {
    await page.goto("/dashboard?tab=overview");    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#dashboard-tabs").getByRole("button", { name: "Overview" })).toBeVisible();
    await expect(page.locator("#dashboard-tabs").getByRole("button", { name: "Scans" })).toBeVisible();
    await expect(page.locator("#dashboard-tabs").getByRole("button", { name: "Monitor" })).toHaveCount(0);
    await expect(page.locator("#dashboard-tabs").getByRole("button", { name: "Remediate" })).toHaveCount(0);
  });

  test("customer_viewer sees overview and scans only", async ({ page }) => {
    await mockDashboardSession(page, {
      email: "customer@test.com",
      tenantId: "tenant-child",
      tenantName: "Regional Bank",
      role: "customer_viewer",
      userId: "user-customer",
      capabilities: { canAdmin: false, canWrite: false, canViewCompliance: true, canInvite: false },
    });
    await page.goto("/dashboard");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scans" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Portfolio" })).toHaveCount(0);
  });

  test("partner_admin sees portfolio tab", async ({ page }) => {
    await mockDashboardSession(page, {
      email: "partner@test.com",
      tenantId: "parent-mssp",
      tenantName: "Demo MSSP",
      role: "partner_admin",
      userId: "user-partner",
      capabilities: { canAdmin: true, canWrite: true, canViewCompliance: true, canInvite: true },
    });
    await mockDashboardTenantRoutes(page, {
      summary: {
        ...summaryPayload,
        me: { ...summaryPayload.me, role: "partner_admin", tenantId: "parent-mssp" },
        portfolioSummary: { childrenCount: 2 },
      },
    });

    await page.goto("/dashboard?tab=portfolio");
    await expect(page.getByRole("button", { name: "Portfolio" })).toBeVisible({ timeout: 15000 });
  });
});