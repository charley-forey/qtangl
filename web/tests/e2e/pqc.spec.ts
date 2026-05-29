import { expect, test } from "@playwright/test";

test.describe("PQC demo", () => {
  test("loads demo page and shows scenario picker", async ({ page }) => {
    await page.goto("/demo/pqc");
    await expect(page.getByRole("heading", { name: /Q-Day readiness/i })).toBeVisible();
    await expect(page.getByText(/Regional bank TLS inventory/i)).toBeVisible();
  });

  test("fixture scan shows scoreboard when backend is reachable", async ({ page }) => {
    await page.goto("/demo/pqc");
    await page.getByRole("button", { name: /Run Q-Day scan/i }).click();
    const scoreboard = page.getByText(/Q-Day readiness score/i);
    await expect(scoreboard.first()).toBeVisible({ timeout: 30_000 });
  });
});
