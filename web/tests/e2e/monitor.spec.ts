import { expect, test } from "@playwright/test";

test.describe("Monitor marketing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/monitor");
    await page.waitForLoadState("networkidle");
  });

  test("shows command center and scenario picker", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Catch crypto drift/i })).toBeVisible();
    await expect(page.locator("#command-center")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Financial services" })).toBeVisible();
  });

  test("scenario switch updates readiness KPI", async ({ page }) => {
    await expect(page.getByText("61.8").first()).toBeVisible();
    await page.getByRole("tab", { name: "Healthcare" }).click();
    await expect(page.getByText("54.2").first()).toBeVisible();
  });

  test("drift timeline scrubber changes week label", async ({ page }) => {
    await expect(page.locator("#drift-timeline")).toBeVisible();
    const slider = page.getByRole("slider", { name: "Drift timeline week" });
    await slider.fill("0");
    await expect(page.getByText(/Week 1 · Score/i)).toBeVisible();
  });

  test("persona tabs render", async ({ page }) => {
    await expect(page.locator("#personas")).toBeVisible();
    await page.getByRole("tab", { name: "Security engineer" }).click();
    await expect(page.getByText(/Latest drift diff/i)).toBeVisible();
  });

  test("alert preview has Slack and Teams tabs", async ({ page }) => {
    await expect(page.locator("#alerts")).toBeVisible();
    await expect(page.getByRole("button", { name: "Slack" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Microsoft Teams" })).toBeVisible();
  });

  test("sticky CTA appears after scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(page.getByRole("link", { name: "Request Monitor pilot" }).last()).toBeVisible();
  });

  test("workflow tour supports step navigation buttons", async ({ page }) => {
    await page.getByRole("button", { name: "Next workflow step" }).first().click();
    await expect(page.getByRole("heading", { name: /Re-inventory authorized targets/i })).toBeVisible();
    await page.getByRole("button", { name: "Next workflow step" }).first().click();
    await expect(page.getByRole("heading", { name: /Compare snapshot to snapshot/i })).toBeVisible();
    await page.getByRole("button", { name: "Previous workflow step" }).first().click();
    await expect(page.getByRole("heading", { name: /Re-inventory authorized targets/i })).toBeVisible();
  });

  test("no horizontal overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/monitor");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return scrollWidth - clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
