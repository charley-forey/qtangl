import { test, expect } from "@playwright/test";

test.describe("Remediation program", () => {
  test("convert guide references remediation workflow", async ({ page }) => {
    await page.goto("/docs/guides/convert");
    await expect(page.getByText(/remediation/i).first()).toBeVisible();
  });
});
