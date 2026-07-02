import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const mobileAuditRoutes = ["/", "/platform", "/pricing", "/compare", "/docs", "/dashboard", "/assess", "/assess/mini", "/assess/start"] as const;

test.describe("Mobile accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  for (const route of mobileAuditRoutes) {
    test(`no critical or serious violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter(
        (violation) => violation.impact === "critical" || violation.impact === "serious"
      );

      expect(blocking).toEqual([]);
    });
  }
});
