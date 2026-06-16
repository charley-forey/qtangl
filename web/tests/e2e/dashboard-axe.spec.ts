import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Dashboard accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/dashboard/tenant/dashboard/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          me: { tenantId: "t1", persistenceEnabled: true, role: "admin", entitlements: { tier: "pro" } },
          kpis: { latestReadiness: 70 },
          trend: [],
          digest: null,
          commandCenter: null,
          alerts: [],
          recentScans: [],
          schedulesSummary: { active: 0 },
          health: {},
          latestScanDetail: null,
          forecast: null,
          remediationVelocity: null,
          sloMetrics: null,
          integrationsSummary: null,
          layoutDefaults: { persona: "operator", pinned: [], hidden: [] },
          membershipHealth: [],
        }),
      });
    });
    await page.route("**/api/dashboard/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          session: {
            email: "a@t.com",
            tenantId: "t1",
            tenantName: "T",
            role: "admin",
            userId: "u1",
            memberships: [{ tenantId: "t1", tenantName: "T", role: "admin" }],
          },
        }),
      });
    });
  });

  for (const viewport of [
    { name: "desktop", width: 1280, height: 800 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    test(`overview has no serious axe violations (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/dashboard");
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious).toEqual([]);
    });
  }
});
