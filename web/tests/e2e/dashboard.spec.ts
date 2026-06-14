import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Q-Day command center/i })).toBeVisible();
    await expect(page.locator("#connect-key").getByText("Tenant API key")).toBeVisible();
  });
});
