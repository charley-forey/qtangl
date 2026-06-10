import { test, expect } from "@playwright/test";

test.describe("crypto flip UI", () => {
  test("docs crypto-flip guide loads", async ({ page }) => {
    await page.goto("/docs/guides/crypto-flip");
    await expect(page.getByRole("heading", { name: /crypto flip/i })).toBeVisible();
  });

  test("crypto-flip API reference loads", async ({ page }) => {
    await page.goto("/docs/reference/crypto-flip-api");
    await expect(page.getByText(/dry-run/i)).toBeVisible();
  });
});
