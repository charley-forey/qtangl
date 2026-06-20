import { expect, test } from "@playwright/test";

test("homepage primary CTA links to assess", async ({ page }) => {
  await page.goto("/");
  const runScan = page.getByRole("link", { name: /Run Q-Day scan/i }).first();
  await expect(runScan).toBeVisible();
  await expect(runScan).toHaveAttribute("href", "/assess");
});

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

test("mini-assessment email gate unlocks fixture preview", async ({ page }) => {
  await page.goto("/assess/mini");
  await page.getByPlaceholder("you@company.com").fill("buyer@example.com");
  await page.getByRole("button", { name: /Show my results/i }).click();
  await expect(page.getByText(/Readiness score/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /Download sample CBOM/i })).toBeVisible();
});

test("verify page accepts scanId query param", async ({ page }) => {
  await page.goto("/verify?scanId=golden-bank-tls-inventory");
  await expect(page.getByText(/verify|scan/i).first()).toBeVisible();
});

test("verify page navigates when scan id is pasted", async ({ page }) => {
  await page.goto("/verify");
  const input = page.getByPlaceholder(/scan-/i);
  await input.fill("golden-bank-tls-inventory");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveURL(/scanId=golden-bank-tls-inventory/);
});
