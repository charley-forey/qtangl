import { test, expect } from "@playwright/test";

test("access page shows short form and mailto fallback", async ({ page }) => {
  await page.goto("/access");
  await expect(page.getByRole("heading", { name: /Request pilot access/i, level: 1 })).toBeVisible();
  await expect(page.getByLabel(/Work email/i)).toBeVisible();
  await expect(page.getByLabel(/Interest area/i)).toBeVisible();
  await expect(page.locator("#main-content").getByRole("link", { name: "charley@qtangl.com" })).toBeVisible();
  await expect(page.getByText(/What happens next/i)).toBeVisible();
});

test("access optional context expands", async ({ page }) => {
  await page.goto("/access");
  await page.getByRole("button", { name: /Add context — helps us prioritize/i }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/^Company$/i)).toBeVisible();
  await expect(page.getByLabel(/Current tools/i)).toBeVisible();
  await expect(page.getByLabel(/Readiness context/i)).toBeVisible();
});

test("access form validates required fields", async ({ page }) => {
  await page.goto("/access");
  const accessForm = page.locator("form").filter({ has: page.getByLabel(/^Interest area$/i) });
  await page.waitForTimeout(2500);
  await accessForm.getByRole("button", { name: /^Request access$/i }).click();
  await expect(page.locator("#access-email-error")).toContainText(/work email/i);
  await expect(page.locator("#access-interest-error")).toContainText(/interest area/i);
});

test("access form submits with minimal fields", async ({ page }) => {
  await page.goto("/access");
  await page.getByLabel(/Work email/i).fill("pilot@example.com");
  await page.getByLabel(/Interest area/i).selectOption("Q-Day Assessment (one-time)");
  await page.getByRole("button", { name: /^Request access$/i }).click();
  await expect(page.getByRole("heading", { name: /You're on the list/i })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("link", { name: /Run Q-Day scanner/i })).toBeVisible();
});

test("access page preserves interest query param", async ({ page }) => {
  await page.goto("/access?interest=Q-Day%20Monitor%20(annual)&source=roi");
  await expect(page.getByLabel(/Interest area/i)).toHaveValue("Q-Day Monitor (annual)");
  await expect(page.getByText(/Referred from: roi/i)).toBeVisible();
});

test("homepage primary CTA links to Q-Day scanner", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Run Q-Day scan/i }).first()).toHaveAttribute(
    "href",
    "/assess"
  );
});

test("readiness nav links resolve", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Platform", exact: true }).click();
  await expect(page).toHaveURL("/platform");
  await expect(page.getByRole("heading", { level: 1, name: /Assess\. Monitor\. Convert\./i })).toBeVisible();
});

test("journey page shows maturity model", async ({ page }) => {
  await page.goto("/journey");
  await expect(page.getByRole("heading", { level: 1, name: /Find out where you are — and what to do next/i })).toBeVisible();
  await page.getByRole("button", { name: /^3\. Monitored$/i }).click();
  await expect(page.getByText("Stage 3 — Monitored", { exact: true })).toBeVisible();
});

test("resources hub links to ROI and FAQ", async ({ page }) => {
  await page.goto("/resources");
  await expect(page.getByRole("heading", { level: 1, name: /Tools for your Q-Day program/i })).toBeVisible();
  await page.getByRole("link", { name: "ROI calculator" }).click();
  await expect(page).toHaveURL("/resources/roi");
  await expect(page.getByRole("heading", { level: 1, name: /Status quo vs Qtangl Monitor/i })).toBeVisible();
});

test("ROI calculator shows savings comparison", async ({ page }) => {
  await page.goto("/resources/roi");
  await expect(page.getByText(/^Status quo$/i)).toBeVisible();
  await expect(page.getByText(/^With Qtangl Monitor$/i)).toBeVisible();
});

test("mini-assessment gate separates authorized baseline and fixture demo", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/assess/mini");
  await expect(page.getByRole("heading", { level: 1, name: /Your Q-Day exposure in 60 seconds/i })).toBeVisible();
  await page.getByPlaceholder("you@company.com").fill("pilot@example.com");
  await page.getByRole("button", { name: /Show my results/i }).click();
  await expect(page.getByText(/Top 5 findings/i)).toBeVisible({ timeout: 15000 });
  const baseline = page.getByRole("link", { name: "Start authorized baseline", exact: true });
  await expect(baseline).toBeVisible();
  await expect(baseline).toHaveAttribute("href", "/assess/start");
  const fixtureDemo = page.getByRole("link", { name: "Try full demo (fixture)", exact: true });
  await expect(fixtureDemo).toBeVisible();
  const fixtureUrl = new URL((await fixtureDemo.getAttribute("href"))!, page.url());
  expect(fixtureUrl.pathname).toBe("/assess");
  expect(fixtureUrl.searchParams.get("autorun")).toBe("1");
  expect(fixtureUrl.searchParams.get("intent")).toBe("sample");
});

test("executive briefing gate unlocks content", async ({ page }) => {
  await page.goto("/q-day/briefing");
  await expect(page.getByRole("heading", { level: 1, name: /Q-Day readiness for boards/i })).toBeVisible();
  await page.getByPlaceholder("Ada Lovelace").fill("Jane CISO");
  await page.getByPlaceholder("CISO · Example Bank").fill("CISO · Example Bank");
  await page.getByPlaceholder("you@company.com").fill("ciso@example.com");
  await page.getByRole("button", { name: /Unlock briefing/i }).click();
  await expect(page.getByText(/Mosca's inequality/i)).toBeVisible({ timeout: 15000 });
});

test("monitor page shows alert preview", async ({ page }) => {
  await page.goto("/monitor");
  await expect(page.getByText(/Alert preview — Monitor tier/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Slack" })).toBeVisible();
});
