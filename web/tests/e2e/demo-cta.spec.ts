import { expect, test } from "@playwright/test";

test("homepage primary CTA links to assess", async ({ page }) => {
  await page.goto("/");
  const runScan = page.getByRole("link", { name: /Run Q-Day scan/i }).first();
  await expect(runScan).toBeVisible();
  await expect(runScan).toHaveAttribute("href", "/assess");
});

test("homepage links to assess or platform demo path", async ({ page }) => {
  await page.goto("/");
  const assessLink = page.getByRole("link", { name: /assess|mini-assessment|q-day/i }).first();
  const platformLink = page.getByRole("link", { name: /platform|monitor|demo/i }).first();
  const hasCta = (await assessLink.count()) > 0 || (await platformLink.count()) > 0;
  expect(hasCta).toBeTruthy();
});

test("mini-assessment page loads scenario picker", async ({ page }) => {
  await page.goto("/assess/mini");
  await expect(page.getByRole("button", { pressed: true }).first()).toBeVisible();
});

test("mini-assessment email gate unlocks fixture preview", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/assess/mini");
  await page.getByPlaceholder("you@company.com").fill("buyer@example.com");
  await page.getByRole("button", { name: /Show my results/i }).click();
  await expect(page.getByText("Readiness score", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /Download sample CBOM/i })).toBeVisible();
});

test("verify page accepts scanId query param", async ({ page }) => {
  await page.goto("/verify?scanId=golden-bank-tls-inventory");
  await expect(page.getByText(/verify|scan/i).first()).toBeVisible();
});

test("verify page navigates when scan id is pasted", async ({ page }) => {
  await page.goto("/verify");
  const input = page.getByPlaceholder(/scan-/i);
  await input.fill("golden-bank-tls-inventory");
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(page).toHaveURL(/scanId=golden-bank-tls-inventory/);
});

test("live status retains report data after a failed refresh and recovers on retry", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  let failRefresh = false;
  let readinessScore = 82.8;
  const requested = new Set<string>();

  await page.addInitScript(() => {
    class DemoEventSource extends EventTarget {
      onopen: (() => void) | null = null;
      constructor() {
        super();
        Object.assign(window, { demoTestEvents: this });
        queueMicrotask(() => this.onopen?.());
      }
      close() {}
    }
    Object.defineProperty(window, "EventSource", { value: DemoEventSource });
  });

  await page.route(/\/demo\/(status|trend|graph|compliance|portfolio|narration)(?:\?|$)/, async (route) => {
    const endpoint = new URL(route.request().url()).pathname;
    requested.add(endpoint);
    expect(route.request().method()).toBe("GET");
    if (endpoint === "/demo/status" && failRefresh) {
      await route.abort("failed");
      return;
    }
    const responses: Record<string, unknown> = {
      "/demo/status": {
        status: "success", simulation: true, honestyNote: "Controlled test fixture", resources: [],
        cadenceSec: 60, chaosEnabled: false,
        latestSnapshot: {
          id: "demo-test-snapshot", scanId: "demo-test-scan", readinessScore,
          readinessBand: "In progress", hndlExposed: 9, alerts: [], perResourceStatus: [],
          severityCounts: { critical: 1, high: 9, medium: 3, low: 4, info: 2 },
        },
      },
      "/demo/trend": {
        status: "success",
        points: [{ snapshotId: "demo-test-snapshot", scanId: "demo-test-scan", createdAt: "2026-09-01T12:00:00Z", readinessScore }],
      },
      "/demo/graph": { status: "success", scanId: "demo-test-scan", nodes: [], edges: [] },
      "/demo/compliance": { status: "success", frameworks: [], complianceSummary: {}, honestyNotes: [] },
      "/demo/portfolio": {
        status: "success", overallReadiness: readinessScore, overallBand: "In progress",
        units: [{ businessUnit: "Demo platform unit", assetCount: 3, readinessScore: null }],
      },
      "/demo/narration": { status: "success", narration: "Controlled test inventory is available." },
    };
    await route.fulfill({ json: responses[endpoint] });
  });

  await page.goto("/demo/live/status");
  await expect(page.getByRole("heading", { name: "Live status wall", exact: true })).toBeVisible();
  await expect(page.getByText("Full report severity mix", { exact: true })).toBeVisible();
  await expect(page.getByText("Includes baseline scenario assets plus enabled demo resources.", { exact: true })).toBeVisible();
  const overall = page.getByText(/^Full report readiness:/);
  await expect(overall).toContainText("82.8/100");
  const unit = page.getByText("Demo platform unit", { exact: true }).locator("..").locator("..");
  await expect(unit).toContainText("Readiness unavailable");
  await expect(unit.locator('[style*="width"]')).toHaveCount(0);
  const legend = page.getByRole("list", { name: "Severity counts" });
  await expect(legend).toBeVisible();
  for (const [severity, count] of Object.entries({ critical: 1, high: 9, medium: 3, low: 4, info: 2 })) {
    await expect(legend.getByRole("listitem").filter({ hasText: severity })).toHaveText(new RegExp(`${severity}\\s*${count}$`));
  }
  expect([...requested].sort()).toEqual([
    "/demo/compliance", "/demo/graph", "/demo/narration", "/demo/portfolio", "/demo/status", "/demo/trend",
  ]);

  failRefresh = true;
  await page.evaluate(() => {
    const source = Reflect.get(window, "demoTestEvents");
    if (!(source instanceof EventTarget)) throw new Error("Demo event source was not initialized");
    source.dispatchEvent(new MessageEvent("snapshot", { data: "{}" }));
  });
  const error = page.getByRole("alert").filter({ hasText: "Unable to refresh live status." });
  await expect(error).toContainText("Showing the last available data.");
  await expect(overall).toContainText("82.8/100");
  await expect(legend).toBeVisible();
  await expect(unit).toContainText("Readiness unavailable");

  failRefresh = false;
  readinessScore = 91;
  await error.getByRole("button", { name: "Retry refresh", exact: true }).click();
  await expect(overall).toContainText("91/100");
  await expect(error).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
