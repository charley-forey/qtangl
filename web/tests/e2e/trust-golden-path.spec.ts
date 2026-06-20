import { expect, test } from "@playwright/test";

/**
 * Golden path: public trust → dogfood proof → verify page (<60s target).
 * Dogfood API may be empty in CI — page must still render without crash.
 */
test("trust dogfood page loads and links to verify", async ({ page }) => {
  await page.goto("/trust/dogfood");
  await expect(page.getByRole("heading", { name: /eat our own cooking/i })).toBeVisible();
  await expect(page.getByText(/dogfood/i).first()).toBeVisible();

  const verifyLink = page.getByRole("link", { name: /verify/i }).first();
  if ((await verifyLink.count()) > 0) {
    const href = await verifyLink.getAttribute("href");
    expect(href).toMatch(/verify/);
  }
});

test("trust center links to full dogfood report", async ({ page }) => {
  await page.goto("/trust");
  const dogfoodLink = page.getByRole("link", { name: /full.*dogfood|dogfood report/i });
  if ((await dogfoodLink.count()) > 0) {
    await dogfoodLink.first().click();
    await expect(page).toHaveURL(/\/trust\/dogfood/);
  }
});

test("status page shows platform health", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByRole("heading", { name: /platform status/i })).toBeVisible();
  await expect(page.getByText(/API|operational|degraded|outage/i).first()).toBeVisible();
});
