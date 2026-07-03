import { test, expect } from "@playwright/test";

import {
  mockDashboardEvents,
  mockDashboardSession,
  mockDashboardTenantRoutes,
} from "./helpers/dashboard-bff-mocks";

const summaryPayload = {
  me: {
    tenantId: "tenant-test",
    persistenceEnabled: true,
    role: "operator",
    entitlements: { tier: "enterprise", maxScansPerMonth: 100, maxSchedules: 10 },
    scanCount: 1,
    scansThisMonth: 1,
    latestReadinessScore: 72,
    schedulerEnabled: true,
  },
  kpis: { latestReadiness: 72, latestBand: "on-track", openCritical: 0, scansThisMonth: 1 },
  trend: [{ date: "2026-06-01", score: 72, scanId: "scan-1", band: "on-track" }],
  digest: { headline: "Readiness is 72.", wins: [], risks: [], nextWeekFocus: [], narrative: "Ops" },
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
  schedulesSummary: { active: 1 },
  health: { schedulerEnabled: true, lastScanAt: "2026-06-01T00:00:00Z" },
  latestScanDetail: { scanId: "scan-1", readinessScore: 72 },
  forecast: { projected: 74, current: 72 },
  remediationVelocity: { closedCount: 0, openCount: 1, completionRatePct: 0 },
  sloMetrics: { scanSuccessRatePct: 100, reportAvailabilityPct: 100, sampleSize: 1, targetSloPct: 99 },
  integrationsSummary: { jiraConfigured: false, webhookConfigured: false },
  layoutDefaults: { persona: "operator", pinned: ["kpi"], hidden: [] },
  membershipHealth: [],
};

test.describe("Discovery fleet findings (mocked BFF)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("qtangl_monitor_advanced_open", "1");
    });

    await mockDashboardSession(page, {
      email: "ops@test.com",
      tenantId: "tenant-test",
      tenantName: "Test Co",
      role: "operator",
      userId: "user-op",
      capabilities: { canAdmin: false, canWrite: true, canViewCompliance: true },
    });
    await mockDashboardEvents(page);
    await mockDashboardTenantRoutes(page, {
      summary: summaryPayload,
      settings: { onboarding: { toursCompleted: ["monitor", "overview", "scans", "remediate"] } },
      tabRoutes: {
        monitor: {
          schedules: [],
          schedulesSummary: { active: 1 },
          integrationsSummary: { jiraConfigured: false, webhookConfigured: false },
          cbomAggregate: { componentCount: 0, openConflicts: 0 },
          commandCenter: { businessUnits: { default: 72 } },
        },
      },
    });

    await page.route("**/api/dashboard/tenant/discovery/agents", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          agents: [
            {
              agentId: "agent-1",
              hostname: "web-01",
              os: "linux",
              sensorVersion: "0.1.0",
              status: "online",
              lastSeenAt: "2026-06-01T00:00:00Z",
              findingsCount: 2,
            },
          ],
        }),
      });
    });

    await page.route("**/api/dashboard/tenant/discovery/agents/agent-1/findings*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          agentId: "agent-1",
          findings: [
            {
              findingId: "hf-001",
              algorithm: "RSA-2048",
              location: "/etc/ssl/cert.pem",
              findingType: "certificate",
              confidence: "high",
            },
          ],
          total: 1,
        }),
      });
    });

    await page.route("**/api/dashboard/tenant/discovery/findings/hf-001", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          finding: {
            findingId: "hf-001",
            algorithm: "RSA-2048",
            location: "/etc/ssl/cert.pem",
            findingType: "certificate",
            confidence: "high",
          },
          programItemId: "prog-abc",
        }),
      });
    });

    await page.route("**/api/dashboard/tenant/drift/summary*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sinceDays: 7,
          scopeCount: 0,
          totalAdded: 0,
          totalRemoved: 0,
          bySource: {},
          snapshotCount: 0,
        }),
      });
    });
  });
  test("agent findings open HostFindingDetail drawer", async ({ page }) => {
    await page.goto("/command-center?tab=monitor");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Enrolled agents")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "2", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("RSA-2048")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open in Remediate" })).toBeVisible();
  });
});
