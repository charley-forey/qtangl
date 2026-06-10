import { test, expect } from "@playwright/test";

test.describe("Drift monitoring", () => {
  test("compare hub mentions drift capability", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText(/drift/i).first()).toBeVisible();
  });

  test("drift monitoring docs page loads", async ({ page }) => {
    await page.goto("/docs/guides/drift-monitoring");
    await expect(page.getByRole("heading", { name: /drift monitoring/i })).toBeVisible();
  });
});
