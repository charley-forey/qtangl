import { expect, test } from "@playwright/test";

test("homepage links to assess or platform demo path", async ({ page }) => {
  await page.goto("/");
  const assessLink = page.getByRole("link", { name: /assess|mini-assessment|q-day/i }).first();
  const platformLink = page.getByRole("link", { name: /platform|monitor|demo/i }).first();
  const hasCta = (await assessLink.count()) > 0 || (await platformLink.count()) > 0;
  expect(hasCta).toBeTruthy();
});

test("mini-assessment page loads scenario picker", async ({ page }) => {
  await page.goto("/assess/mini");
  await expect(page.getByRole("button", { pressed: true }).first()).toBeVisible();
});

test("verify page accepts scanId query param", async ({ page }) => {
  await page.goto("/verify?scanId=golden-bank-tls-inventory");
  await expect(page.getByText(/verify|scan/i).first()).toBeVisible();
});
