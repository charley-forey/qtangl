import { test, expect } from "@playwright/test";

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
    await page.route("**/api/dashboard/tenant/dashboard/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(summaryPayload),
      });
    });

    await page.route("**/api/dashboard/me", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            authenticated: true,
            authMethod: "workos",
            session: {
              email: "viewer@test.com",
              tenantId: "tenant-test",
              tenantName: "Test Co",
              role: "viewer",
              userId: "user-viewer",
              memberships: [{ tenantId: "tenant-test", tenantName: "Test Co", role: "viewer" }],
            },
            capabilities: {
              canAdmin: false,
              canWrite: false,
              canViewCompliance: true,
              canManageKeys: false,
              canInvite: false,
            },
          }),
        });
        return;
      }
      await route.continue();
    });
  });

  test("viewer sees overview and scans tabs only", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Scans" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Monitor" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Remediate" })).toHaveCount(0);
  });
});
