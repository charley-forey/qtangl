import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard page loads with sign-in hero", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /post-quantum workspace|Q-Day command center/i })).toBeVisible();
    await expect(page.getByText(/Sign in|workspace/i).first()).toBeVisible();
  });

  test("auth health endpoint returns JSON", async ({ request }) => {
    const response = await request.get("/api/dashboard/auth-health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("workosAuthKitReady");
    expect(body).toHaveProperty("missing");
  });

  test("trend empty state copy when logged out", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/sample data|Sign in/i).first()).toBeVisible();
  });
});
