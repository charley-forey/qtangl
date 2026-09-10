import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard directs signed-out visitors to sign in", async ({ page }) => {
    await page.goto("/command-center");
    await expect(page.getByRole("heading", { name: "Sign in required", exact: true })).toBeVisible();
    await expect(page.locator("#main-content").getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/command-center/login");
  });

  test("auth health endpoint returns JSON", async ({ request }) => {
    const response = await request.get("/api/dashboard/auth-health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("workosAuthKitReady");
    expect(body).toHaveProperty("missing");
  });

  test("trend empty state copy when logged out", async ({ page }) => {
    await page.goto("/command-center");
    await expect(page.getByText(/sample data|Sign in/i).first()).toBeVisible();
  });
});
