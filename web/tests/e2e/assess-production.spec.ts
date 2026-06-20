import { expect, test } from "@playwright/test";

test.describe("Assess production signup (mocked API)", () => {
  test("signup form validates domain against email", async ({ page }) => {
    await page.route("**/public/assess-signup", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", assessUrl: "/assess?onboarding=mock" }),
      });
    });

    await page.goto("/assess/start");
    await page.getByLabel(/Work email/i).fill("user@example.com");
    await page.getByLabel(/^Company$/i).fill("Example Inc");
    await page.getByPlaceholder(/api.example.com/i).fill("other.org");
    await page.getByRole("button", { name: /Create Assess workspace/i }).click();

    await expect(page.getByText(/should match your work email domain/i)).toBeVisible();
  });

  test("matching domain redirects to assess workspace", async ({ page }) => {
    await page.route("**/public/assess-signup", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          assessUrl: "/assess?onboarding=mock-token&mode=production",
          allowlistSeeded: true,
        }),
      });
    });

    await page.goto("/assess/start");
    await page.getByLabel(/Work email/i).fill("user@example.com");
    await page.getByLabel(/^Company$/i).fill("Example Inc");
    await page.getByPlaceholder(/api.example.com/i).fill("api.example.com");
    await page.getByRole("button", { name: /Create Assess workspace/i }).click();

    await page.waitForURL(/\/assess\?onboarding=mock-token/, { timeout: 10_000 });
  });

  test("signup without domain shows API warning", async ({ page }) => {
    await page.route("**/public/assess-signup", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          assessUrl: "/assess?onboarding=mock-token&mode=production",
          allowlistSeeded: false,
          warning: "No domain provided — add authorized domains in the dashboard before running a live scan.",
        }),
      });
    });

    await page.goto("/assess/start");
    await page.getByLabel(/Work email/i).fill("user@example.com");
    await page.getByLabel(/^Company$/i).fill("Example Inc");
    await page.getByRole("button", { name: /Create Assess workspace/i }).click();

    await expect(page.getByText(/No domain provided/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Open production assess workspace/i })).toBeVisible();
  });
});
