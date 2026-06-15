import { test, expect } from "@playwright/test";

test.describe("dashboard auth", () => {
  test("dashboard loads sign-in path when WorkOS enabled", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/command center|dashboard session|sign in/i).first()).toBeVisible();
  });

  test("legacy API key card hidden when legacy flag disabled", async ({ page }) => {
    await page.goto("/dashboard");
    const keyCard = page.getByText("Paste the tenant key");
    if (process.env.NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_LEGACY_KEY === "false") {
      await expect(keyCard).toHaveCount(0);
    }
  });
});
