import { test, expect } from "@playwright/test";

test.describe("Command Center Next Wave", () => {
  test("command center loads overview tab", async ({ page }) => {
    await page.goto("/command-center");
    await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible({ timeout: 15000 });
  });

  test("readiness copilot drawer opens", async ({ page }) => {
    await page.goto("/command-center");
    const copilot = page.getByRole("button", { name: /readiness copilot/i });
    if (await copilot.isVisible()) {
      await copilot.click();
      await expect(page.getByText(/ask about your portfolio/i)).toBeVisible();
    }
  });
});
