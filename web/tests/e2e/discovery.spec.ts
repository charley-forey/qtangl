import { test, expect } from "@playwright/test";

test.describe("Discovery depth", () => {
  test("compare hub still renders discovery chart", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /PQC vendor comparison/i })).toBeVisible();
    await expect(page.locator("#matrix table").first()).toBeVisible();
  });

  test("coverage page mentions discovery sources", async ({ page }) => {
    await page.goto("/coverage");
    await expect(page.getByText(/inventory sources/i)).toBeVisible();
  });

  test("assess wizard shows discovery scope step", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByText(/Discovery scope/i)).toBeVisible();
    await expect(page.getByText(/Host fleet/i)).toBeVisible();
    await expect(page.getByText(/Source code/i)).toBeVisible();
    await expect(page.getByText(/Container images/i)).toBeVisible();
  });

  test("compare matrix shows Qtangl partial discovery", async ({ page }) => {
    await page.goto("/compare/qtangl");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("blog post on native discovery depth is published", async ({ page }) => {
    await page.goto("/blog/qtangl-native-discovery-depth-2026");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
