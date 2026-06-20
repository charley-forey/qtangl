import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Assess page", () => {
  test("landing sections render", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByRole("heading", { name: /Q-Day readiness/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Three paths to your baseline/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Common questions/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Download sample CBOM/i })).toBeVisible();
  });

  test("intent picker shows three assessment paths", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByRole("heading", { name: /What do you want to do/i })).toBeVisible();
    await expect(page.getByText(/See a sample report/i)).toBeVisible();
    await expect(page.getByText(/Try a real live scan/i)).toBeVisible();
    await expect(page.getByText(/Scan my organization/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Run bank sample now/i })).toBeVisible();
  });

  test("no critical a11y violations on intent picker pre-scan", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByRole("heading", { name: /What do you want to do/i })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(blocking).toEqual([]);
  });

  test("customize wizard shows sample steps", async ({ page }) => {
    await page.goto("/assess");
    await page.getByRole("button", { name: /Pick another scenario/i }).click();
    await expect(page.getByText("1. Scenario")).toBeVisible();
    await expect(page.getByText("2. Scope")).toBeVisible();
    await expect(page.getByText("3. Run")).toBeVisible();
    await expect(page.getByText(/Regional bank TLS inventory/i)).toBeVisible();
  });

  test("fixture scan shows executive results", async ({ page }) => {
    await page.goto("/assess");
    await page.getByRole("button", { name: /Pick another scenario/i }).click();
    await page.getByRole("button", { name: /Next: Scope/i }).click();
    await page.getByRole("button", { name: /Next: Run/i }).click();
    await page.getByRole("button", { name: /Run Q-Day scan/i }).click();
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Q-Day readiness score/i).first()).toBeVisible();
  });

  test("autorun bank scenario completes without manual run", async ({ page }) => {
    const started = Date.now();
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Q-Day readiness score/i).first()).toBeVisible();
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(15_000);
  });

  test("gov contractor autorun completes", async ({ page }) => {
    await page.goto("/assess?scenario=gov-contractor-cmmc&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
  });

  test("healthcare autorun completes", async ({ page }) => {
    await page.goto("/assess?scenario=healthcare-insurer-hndl&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
  });

  test("technical tab shows handshake proof", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Technical" }).click();
    await expect(page.getByText(/handshake proof/i)).toBeVisible();
  });

  test("executive tab shows peer band", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Industry peer band/i)).toBeVisible();
  });

  test("evidence tab includes board export", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Evidence" }).click();
    await expect(page.getByRole("link", { name: /^Board$/i })).toBeVisible();
  });

  test("executive tab shows Mosca timeline", async ({ page }) => {
    await page.goto("/assess?scenario=bank-tls-inventory&autorun=1");
    await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Mosca timeline/i)).toBeVisible();
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
    await page.getByRole("button", { name: /Pick another scenario/i }).click();
    await page.getByRole("button", { name: /Next: Scope/i }).click();
    await expect(page.getByText(/External discovery|agentless baseline/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Dashboard/i }).first()).toBeVisible();
  });

  test("my-domain path shows authorized workspace guidance", async ({ page }) => {
    await page.goto("/assess");
    await page.getByRole("button", { name: /Scan my organization/i }).click();
    await expect(page.getByRole("link", { name: /Create free Assess workspace/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Request sales-led pilot/i })).toBeVisible();
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

  test("public demo shows production customer footer", async ({ page }) => {
    await page.goto("/assess");
    await expect(page.getByText(/Production customers:/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /start an authorized workspace/i })).toBeVisible();
  });

  test("assess start signup page renders", async ({ page }) => {
    await page.goto("/assess/start");
    await expect(page.getByRole("heading", { name: /authorized baseline/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create Assess workspace/i })).toBeVisible();
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
