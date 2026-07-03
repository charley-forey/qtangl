import { expect, test } from "@playwright/test";

const primaryRoutes = [
  "/",
  "/platform",
  "/assess",
  "/monitor",
  "/convert",
  "/trust",
  "/pricing",
  "/docs",
  "/command-center",
] as const;

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const { scrollWidth, clientWidth } = document.documentElement;
    return scrollWidth - clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("Mobile responsive layout", () => {
  for (const route of primaryRoutes) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });
  }

  test("mobile menu scrolls to reveal all navigation items", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const dialog = page.getByRole("dialog");
    const aboutLink = dialog.getByRole("link", { name: "About" });
    await aboutLink.scrollIntoViewIfNeeded();
    await expect(aboutLink).toBeVisible();
  });

  test("tablet viewport opens a visible navigation dialog", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Platform" })).toBeVisible();
  });

  test("desktop docs search opens a visible dialog", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/docs");

    await page.getByRole("button", { name: /Search docs/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("searchbox", { name: "Search documentation" })).toBeVisible();
  });
});
