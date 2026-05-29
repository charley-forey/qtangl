import { test, expect } from "@playwright/test";

test("access page shows short form and mailto fallback", async ({ page }) => {
  await page.goto("/access");
  await expect(page.getByRole("heading", { name: /Request pilot access/i, level: 1 })).toBeVisible();
  await expect(page.getByLabel(/Work email/i)).toBeVisible();
  await expect(page.getByLabel(/Planning workflow/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "charley@qtangl.com" })).toBeVisible();
  await expect(page.getByText(/What happens next/i)).toBeVisible();
});

test("access optional context expands", async ({ page }) => {
  await page.goto("/access");
  await page.getByRole("button", { name: /Add context/i }).click();
  await expect(page.getByLabel(/^Name$/i)).toBeVisible();
  await expect(page.getByLabel(/^Company$/i)).toBeVisible();
  await expect(page.getByLabel(/Current tools/i)).toBeVisible();
  await expect(page.getByLabel(/Planning context/i)).toBeVisible();
});

test("access form validates required fields", async ({ page }) => {
  await page.goto("/access");
  await page.getByRole("button", { name: /^Request access$/i }).click();
  await expect(page.getByText(/Enter your work email and select a planning workflow/i)).toBeVisible();
});

test("access form submits with minimal fields", async ({ page }) => {
  await page.goto("/access");
  await page.getByLabel(/Work email/i).fill("pilot@example.com");
  await page.getByLabel(/Planning workflow/i).selectOption("Scheduling optimization");
  await page.getByRole("button", { name: /^Request access$/i }).click();
  await expect(page.getByRole("heading", { name: /You're on the list/i })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("link", { name: /Hospital re-staffing demo/i })).toBeVisible();
});

test("access page preserves interest query param", async ({ page }) => {
  await page.goto("/access?interest=Routing%20optimization&source=roi");
  await expect(page.getByLabel(/Planning workflow/i)).toHaveValue("Routing optimization");
  await expect(page.getByText(/Referred from: roi/i)).toBeVisible();
});
