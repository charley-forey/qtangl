import { test, expect } from "@playwright/test";

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
