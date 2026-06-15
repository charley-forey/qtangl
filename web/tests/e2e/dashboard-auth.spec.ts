import { test, expect } from "@playwright/test";

test.describe("dashboard auth", () => {
  test("dashboard loads sign-in path when WorkOS enabled", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/command center|Sign in|workspace/i).first()).toBeVisible();
  });

  test("login page shows unavailable or redirects when WorkOS partial", async ({ page }) => {
    await page.goto("/dashboard/login");
    await expect(page.getByText(/sign-in|unavailable|AuthKit/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("legacy API key card hidden on main path", async ({ page }) => {
    await page.goto("/dashboard");
    const keyCard = page.getByText("Paste the tenant key");
    await expect(keyCard).toHaveCount(0);
    const advanced = page.getByText("automation API key");
    if (await advanced.count()) {
      await expect(advanced).not.toBeVisible();
    }
  });
});
