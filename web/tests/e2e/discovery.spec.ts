import { test, expect } from "@playwright/test";

import { gotoAssessScanner } from "./helpers/assess";

test.describe.configure({ timeout: 120_000 });

test.describe("Discovery depth", () => {
  test("compare hub still renders discovery chart", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /PQC vendor comparison/i })).toBeVisible();
    await expect(page.locator("#matrix table").first()).toBeVisible();
  });

  test("coverage page mentions discovery sources", async ({ page }) => {
    await page.goto("/platform/coverage");
    await expect(page.getByText(/inventory sources/i)).toBeVisible();
  });

  test("assess wizard shows discovery scope step", async ({ page }) => {
    await gotoAssessScanner(page);
    await page.getByRole("button", { name: /Pick another scenario/i }).click();
    await page.getByRole("button", { name: /Next: Scope/i }).click();
    await expect(page.getByText(/Host fleet/i)).toBeVisible();
    await expect(page.getByText(/Source code/i)).toBeVisible();
    await expect(page.getByText(/Container images/i)).toBeVisible();
  });

  test("host sensor deploy docs page is live", async ({ page }) => {
    await page.goto("/docs/guides/host-sensor-deploy");
    await expect(page.getByRole("heading", { name: /Host sensor deployment/i })).toBeVisible();
  });

  test("code scan CI docs page is live", async ({ page }) => {
    await page.goto("/docs/guides/code-scan-ci");
    await expect(page.getByRole("heading", { name: /Code scan CI/i })).toBeVisible();
  });

  test("blog post on native discovery depth is published", async ({ page }) => {
    await page.goto("/blog/qtangl-native-discovery-depth-2026");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
