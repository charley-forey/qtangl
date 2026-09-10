import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

import {
  mockDashboardEvents,
  mockDashboardQrosRoutes,
  mockDashboardSession,
  mockDashboardTenantRoutes,
} from "./helpers/dashboard-bff-mocks";

const summaryPayload = {
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
      proof: { deepLink: "/command-center?tab=monitor" },
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
};

test.describe("Dashboard authenticated (mocked BFF)", () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardSession(page, {
      email: "admin@test.com",
      tenantId: "tenant-test",
      tenantName: "Test Co",
      role: "admin",
      userId: "user-1",
    });
    await mockDashboardEvents(page);
    await mockDashboardTenantRoutes(page, {
      summary: summaryPayload,
      settings: {
        scanAllowlist: ["example.com"],
        billing: { termsAcceptedAt: "2026-06-01", termsVersion: "2026-06-08" },
        onboarding: { toursCompleted: ["overview", "monitor", "scans", "remediate"] },
      },
      tabRoutes: {
        monitor: {
          schedules: [],
          schedulesSummary: { active: 0 },
          integrationsSummary: { jiraConfigured: false, webhookConfigured: false },
          cbomAggregate: { componentCount: 0, openConflicts: 0 },
          commandCenter: { businessUnits: {} },
        },
      },
    });
    await mockDashboardQrosRoutes(page);
  });

  test("overview renders posture command bar from summary", async ({ page }) => {
    await page.goto("/command-center?tab=overview");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Posture command bar")).toBeVisible();
    await expect(page.getByText("78").first()).toBeVisible();
  });

  test("dependency graph mounts and renders nodes with normal motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.route("**/api/dashboard/tenant/qros/digital-twin/scan-1*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          graph: {
            nodes: [
              { id: "host-1", label: "example.com", kind: "host" },
              { id: "algo-1", label: "RSA", kind: "algorithm" },
            ],
            edges: [{ source: "host-1", target: "algo-1" }],
          },
          blastRadius: [],
          simulationNote: "Inventory relationships only.",
        }),
      });
    });
    await page.goto("/command-center?tab=remediate&scanId=scan-1&ccv2=1");
    const graph = page.getByRole("img", { name: "Crypto dependency graph with 2 nodes" });
    await expect(graph).toBeVisible({ timeout: 15000 });
    await expect(graph.locator("circle")).toHaveCount(2);
    await expect(graph.locator("line")).toHaveCount(1);
  });

  test("overview shows QROS morning briefing and NBA feed", async ({ page }) => {
    await page.goto("/command-center?tab=overview");
    await expect(page.getByText("Morning briefing")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Next best actions")).toBeVisible();
    await expect(page.getByText("Enable weekly monitor cadence")).toBeVisible();
  });

  test("overview shows personalized recommendations in details", async ({ page }) => {
    await page.goto("/command-center?tab=overview");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Show details" }).click();
    await expect(page.getByText("Recommended next steps")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Monitoring schedule not configured")).toBeVisible();
    await expect(page.getByText("Crypto-agility maturity")).toBeVisible();
  });

  test("global lens filters sync to URL", async ({ page }) => {
    await page.goto("/command-center?tab=overview");
    await expect(page.getByRole("tabpanel")).toBeVisible({ timeout: 15000 });
    await page.getByLabel("Framework").selectOption("CMMC");
    await expect(page).toHaveURL(/framework=CMMC/);
    await expect(page.getByLabel("Global lens filters")).toBeVisible();
  });

  test("NBA snooze removes action from feed", async ({ page }) => {
    await page.goto("/command-center?tab=overview");
    await expect(page.getByText("Enable weekly monitor cadence")).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Snooze" }).click();
    await expect(page.getByText("Enable weekly monitor cadence")).not.toBeVisible({ timeout: 10000 });
  });

  for (const width of [390, 1280]) {
    test(`authenticated overview accessibility at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/command-center?tab=overview");
      await expect(page.getByLabel("Posture command bar")).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  }

  test("failed snooze keeps the action and shows a retryable error", async ({ page }) => {
    await page.route("**/api/dashboard/tenant/qros/next-actions/*/mutate", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ detail: "Unavailable" }) })
    );
    await page.goto("/command-center?tab=overview");
    await page.getByRole("button", { name: "Snooze", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Unable to update this action" })).toBeVisible();
    await expect(page.getByText("Enable weekly monitor cadence")).toBeVisible();
    await expect(page.getByRole("button", { name: "Snooze", exact: true })).toBeEnabled();
  });

  test("approval executes the previewed scan action and reports failure", async ({ page }) => {
    const requests: Array<{ action: string; dryRun: boolean; approved: boolean; payload: unknown }> = [];
    await page.route("**/api/dashboard/tenant/qros/agentic/execute", async (route) => {
      const body = route.request().postDataJSON();
      requests.push(body);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        status: body.dryRun ? "preview" : "failed",
        steps: ["Schedule a scan"], guardrails: ["Human approval required"],
      }) });
    });
    await page.goto("/command-center?tab=remediate&scanId=scan-1&ccv2=1");
    await page.getByRole("button", { name: "Preview scan schedule" }).click();
    await expect(page.getByLabel("Action guardrails")).toContainText("Human approval required");
    await page.getByRole("button", { name: "Approve & execute (audit logged)" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Action failed" })).toBeVisible();
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({ action: "schedule_scan", dryRun: true });
    expect(requests[1]).toMatchObject({ action: "schedule_scan", dryRun: false, approved: true, payload: requests[0].payload });
  });

  test("scenario failures remain visible and allow retry", async ({ page }) => {
    await page.route("**/api/dashboard/tenant/qros/scenario/simulate", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ detail: "Unavailable" }) })
    );
    await page.goto("/command-center?tab=remediate&scanId=scan-1&ccv2=1");
    await page.getByRole("button", { name: "Conservative", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Unable to simulate" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Conservative", exact: true })).toBeEnabled();
  });

  test("monitor tab collapses advanced monitoring by default", async ({ page }) => {
    await page.goto("/command-center?tab=monitor");
    await expect(page.getByText("Recent activity")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Advanced monitoring")).toBeVisible();
    await expect(page.getByText("Host sensor fleet")).not.toBeVisible();
  });

  test("action=report deep link opens report drawer", async ({ page }) => {
    await page.goto("/command-center?tab=overview&action=report&scanId=scan-1");
    await expect(page.getByRole("dialog", { name: "Migration report" })).toBeVisible({ timeout: 15000 });
  });
});
