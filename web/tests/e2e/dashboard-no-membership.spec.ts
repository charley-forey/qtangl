import { test, expect } from "@playwright/test";

test.describe("Dashboard no membership", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/dashboard/me", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            authenticated: false,
            authMethod: "workos",
            reason: "no_membership",
          }),
        });
        return;
      }
      await route.continue();
    });
  });

  test("shows no workspace linked card", async ({ page }) => {
    await page.goto("/command-center");
    await expect(page.getByText("No workspace linked")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: "Request pilot" })).toBeVisible();
  });
});
