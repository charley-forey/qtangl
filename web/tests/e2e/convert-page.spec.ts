import { test, expect } from "@playwright/test";

test.describe("Convert page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/convert");
    await page.waitForLoadState("domcontentloaded");
  });

  test("hero and KPIs visible", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /Prove the fix with signed evidence/i })).toBeVisible();
    await expect(page.getByText("Readiness score").first()).toBeVisible();
    await expect(page.getByText("Backlog items").first()).toBeVisible();
  });

  test("simulator checkbox toggles projected score", async ({ page }) => {
    const program = page.locator("#convert-program");
    await program.scrollIntoViewIfNeeded();
    const projected = program.getByText("Projected (what-if)").locator("..").locator(".text-emerald-300");
    const before = await projected.textContent();
    const checkbox = program.getByRole("checkbox", { name: /Include Rotate JWKS/i });
    await checkbox.scrollIntoViewIfNeeded();
    await checkbox.click({ force: true });
    const after = await projected.textContent();
    expect(before).not.toEqual(after);
  });

  test("demo preset and reset controls work", async ({ page }) => {
    const program = page.locator("#convert-program");
    await program.scrollIntoViewIfNeeded();
    const preset = program.getByRole("button", { name: "Apply Wave 1 preset" });
    await preset.scrollIntoViewIfNeeded();
    await preset.click({ force: true });
    await expect(program.getByText(/Wave 1 preset:.*edge TLS/i)).toBeVisible();
    const reset = program.getByRole("button", { name: "Reset demo" });
    await reset.scrollIntoViewIfNeeded();
    await reset.click({ force: true });
    await expect(program.getByText(/Demo reset to default/i)).toBeVisible();
  });

  test("evidence tabs switch content", async ({ page }) => {
    const evidence = page.locator("#convert-evidence");
    await evidence.scrollIntoViewIfNeeded();
    const verifyTab = evidence.getByRole("tab", { name: "Verify CLI" });
    await verifyTab.scrollIntoViewIfNeeded();
    await verifyTab.click({ force: true });
    await expect(evidence.getByText(/qtangl-verify/i)).toBeVisible();
    const jiraTab = evidence.getByRole("tab", { name: "Jira ticket" });
    await jiraTab.click({ force: true });
    await expect(evidence.getByText("PQC-142")).toBeVisible();
  });

  test("persona tabs switch copy", async ({ page }) => {
    const personas = page.locator("#convert-personas");
    await personas.scrollIntoViewIfNeeded();
    const grcTab = personas.getByRole("tab", { name: "GRC / Compliance lead" });
    await grcTab.click();
    await expect(grcTab).toHaveAttribute("aria-selected", "true");
    await expect(personas.getByText("Framework-mapped auditor packs")).toBeVisible();
  });

  test("migration diagram has accessible label", async ({ page }) => {
    await expect(page.getByRole("img", { name: /PQC migration path/i })).toBeVisible();
  });

  test("anchor nav is present", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Convert page sections" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("button", { name: "Evidence", exact: true })).toBeVisible();
  });

  test("FAQ accordion expands and collapses", async ({ page }) => {
    await page.evaluate(() => {
      document.getElementById("convert-faq")?.scrollIntoView({ block: "center" });
    });
    const faq = page.locator("#convert-faq");
    const firstQuestion = faq.getByRole("button").first();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    await firstQuestion.evaluate((el) => (el as HTMLButtonElement).click());
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  });

  test("sticky CTA appears after scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 2000));
    await expect(page.getByText(/Migration program with verify-fix proof/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("link", { name: "Request Convert pilot" })).toBeVisible();
  });

  test("no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(() => {
      const { scrollWidth, clientWidth } = document.documentElement;
      return scrollWidth - clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
