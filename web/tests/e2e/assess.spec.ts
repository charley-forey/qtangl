import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Assess page", () => {
  test("landing sections render", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByRole("heading", { name: /Q-Day readiness/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Baseline in four steps/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Common questions/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Download sample CBOM/i })).toBeVisible();
  });

  test("wizard shows four steps", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByText("Scenario")).toBeVisible();
    await expect(page.getByText("Target")).toBeVisible();
    await expect(page.getByText("Scope")).toBeVisible();
    await expect(page.getByText("Run")).toBeVisible();
    await expect(page.getByText(/Regional bank TLS inventory/i)).toBeVisible();
  });

  test("fixture scan shows executive results", async ({ page }) => {
    await page.goto("/assess");
    await page.getByRole("button", { name: /Next: Target/i }).click();
    await page.getByRole("button", { name: /Next: Scope/i }).click();
    await page.getByRole("button", { name: /Next: Run/i }).click();
    await page.getByRole("button", { name: /Run Q-Day scan/i }).click();
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Q-Day readiness score/i).first()).toBeVisible();
  });

  test("autorun bank scenario completes without manual run", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Q-Day readiness score/i).first()).toBeVisible();
  });

  test("tab navigation switches to compliance", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Compliance" }).click();
    await expect(page.getByText(/Compliance|framework/i).first()).toBeVisible();
  });

  test("inventory tab shows table controls", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Inventory" }).click();
    await expect(page.getByRole("button", { name: /Export CSV/i })).toBeVisible();
  });

  test("upsell block shows Monitor CTA post-scan", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("link", { name: /Request Monitor pilot/i })).toBeVisible();
  });

  test("evidence tab includes verify link with scanId", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Evidence" }).click();
    const verifyLink = page.getByRole("link", { name: /verify/i }).first();
    await expect(verifyLink).toBeVisible();
    await expect(verifyLink).toHaveAttribute("href", /scanId=/);
  });

  test("discovery scope shows external baseline only", async ({ page }) => {
    await page.goto("/assess");
    await page.getByRole("button", { name: /Next/i }).click();
    await page.getByRole("button", { name: /Next/i }).click();
    await expect(page.getByText(/external baseline/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Dashboard/i }).first()).toBeVisible();
  });

  test("autorun shows progress banner", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("status")).toContainText(/Running demo scan/i);
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
  });

  test("scanId hydration restores executive results", async ({ page }) => {
    await page.goto("/assess?scanId=golden-bank-tls-inventory");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Q-Day readiness score/i).first()).toBeVisible();
  });

  test("evidence tab shows export format links", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Evidence" }).click();
    await expect(page.getByRole("link", { name: /^PDF$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^CBOM$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy share link/i })).toBeVisible();
  });

  test("remediation what-if shows projection when item selected", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Remediation" }).click();
    const firstItem = page.locator('input[type="checkbox"]').first();
    await expect(firstItem).toBeVisible();
    await firstItem.check();
    await expect(page.getByText(/Projected/i)).toBeVisible({ timeout: 15_000 });
  });

  test("legacy /demo/pqc redirects to /assess", async ({ page }) => {
    const response = await page.goto("/demo/pqc");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/assess/);
  });

  test("legacy methodology redirects", async ({ page }) => {
    await page.goto("/demo/pqc/methodology");
    await expect(page).toHaveURL(/\/assess\/methodology/);
  });

  test("legacy mini mode redirects to /assess/mini", async ({ page }) => {
    await page.goto("/demo/pqc?mode=mini");
    await expect(page).toHaveURL(/\/assess\/mini/);
  });

  test("no critical a11y violations post-scan", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(blocking).toEqual([]);
  });
});
