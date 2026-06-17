import { test, expect } from "@playwright/test";

test.describe("Dashboard authenticated (mocked BFF)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/dashboard/tenant/dashboard/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          me: {
            tenantId: "tenant-test",
            persistenceEnabled: true,
            role: "admin",
            entitlements: { tier: "enterprise", maxScansPerMonth: 100 },
            scanCount: 2,
            scansThisMonth: 2,
            latestReadinessScore: 78,
            schedulerEnabled: true,
          },
          kpis: {
            latestReadiness: 78,
            latestBand: "on-track",
            openCritical: 1,
            scansThisMonth: 2,
          },
          trend: [{ date: "2026-06-01", score: 78, scanId: "scan-1", band: "on-track" }],
          digest: {
            headline: "Portfolio readiness is 78.",
            wins: ["bank-tls: score 78"],
            risks: [],
            nextWeekFocus: ["Close critical items"],
            narrative: "Test narrative",
          },
          commandCenter: { businessUnits: { default: 78 }, highRiskTargets: [] },
          alerts: [],
          recommendations: [
            {
              id: "rec-test-1",
              priority: 1,
              category: "schedule",
              what: "Monitoring schedule not configured",
              soWhat: "Crypto posture can drift between audits.",
              nowWhat: "Create a weekly monitoring schedule.",
              source: "onboarding_schedule",
              proof: { deepLink: "/dashboard?tab=monitor" },
            },
          ],
          maturity: { stage: 2, name: "Prioritized", tier: "Assess + workshop", progressPct: 33 },
          recentScans: [
            {
              scanId: "scan-1",
              status: "done",
              readinessScore: 78,
              readinessBand: "on-track",
              createdAt: "2026-06-01T00:00:00Z",
              updatedAt: "2026-06-01T00:00:00Z",
            },
          ],
          schedulesSummary: { active: 0 },
          health: { schedulerEnabled: true, lastScanAt: "2026-06-01T00:00:00Z" },
          latestScanDetail: { scanId: "scan-1", readinessScore: 78 },
          forecast: { projected: 80, current: 78 },
          remediationVelocity: { closedCount: 1, openCount: 2, completionRatePct: 33 },
          sloMetrics: {
            scanSuccessRatePct: 100,
            reportAvailabilityPct: 100,
            sampleSize: 2,
            targetSloPct: 99,
          },
          integrationsSummary: { jiraConfigured: false, webhookConfigured: false },
          layoutDefaults: { persona: "operator", pinned: ["kpi"], hidden: [] },
          membershipHealth: [{ tenantId: "tenant-test", latestReadinessScore: 78, latestReadinessBand: "on-track" }],
        }),
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
            credentialsReady: true,
            session: {
              email: "admin@test.com",
              tenantId: "tenant-test",
              tenantName: "Test Co",
              role: "admin",
              userId: "user-1",
              memberships: [{ tenantId: "tenant-test", tenantName: "Test Co", role: "admin" }],
            },
          }),
        });
        return;
      }
      await route.continue();
    });
  });

  test("overview renders KPI strip from summary", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("78")).toBeVisible();
    await expect(page.getByText("Executive digest")).toBeVisible();
  });

  test("overview shows personalized recommendations", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Recommended next steps")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Monitoring schedule not configured")).toBeVisible();
    await expect(page.getByText("Crypto-agility maturity")).toBeVisible();
  });
});
