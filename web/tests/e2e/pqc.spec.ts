import { expect, test } from "@playwright/test";

test.describe.configure({ timeout: 120_000 });

test.describe("PQC demo", () => {
  test("autorun fixture scan shows executive results", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/Q-Day readiness score/i).first()).toBeVisible();
  });
});
