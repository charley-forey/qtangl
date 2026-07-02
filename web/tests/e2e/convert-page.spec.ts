import { test, expect } from "@playwright/test";

test.describe("Convert page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/convert");
    await page.waitForLoadState("networkidle");
  });

  test("hero and KPIs visible", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /Prove the fix with signed evidence/i })).toBeVisible();
    await expect(page.getByText("Readiness score").first()).toBeVisible();
    await expect(page.getByText("Backlog items").first()).toBeVisible();
  });

  test("simulator checkbox toggles projected score", async ({ page }) => {
    const projected = page.locator("text=Projected (what-if)").locator("..").locator(".text-emerald-300");
    const before = await projected.textContent();
    const checkbox = page.getByRole("checkbox", { name: /Include Rotate JWKS/i });
    await checkbox.click();
    const after = await projected.textContent();
    expect(before).not.toEqual(after);
  });

  test("evidence tabs switch content", async ({ page }) => {
    await page.getByRole("tab", { name: "Verify CLI" }).click();
    await expect(page.getByText(/qtangl-verify/i)).toBeVisible();
    await page.getByRole("tab", { name: "Jira ticket" }).click();
    await expect(page.getByText("PQC-142")).toBeVisible();
  });

  test("persona tabs switch copy", async ({ page }) => {
    await page.getByRole("tab", { name: /GRC \/ Compliance/i }).click();
    await expect(page.getByText(/Framework-mapped auditor packs/i)).toBeVisible();
  });

  test("migration diagram has accessible label", async ({ page }) => {
    await expect(page.getByRole("img", { name: /PQC migration path/i })).toBeVisible();
  });

  test("anchor nav is present", async ({ page }) => {
    await expect(page.getByRole("navigation", { name: "Convert page sections" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Evidence" })).toBeVisible();
  });

  test("no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return scrollWidth - clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
