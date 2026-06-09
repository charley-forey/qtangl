import { expect, test } from "@playwright/test";

test.describe("Compare hub", () => {
  test("hub renders matrix and competitor cards", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /post-quantum readiness vendors compared/i })).toBeVisible();
    await expect(page.getByText("Capability comparison across vendors")).toBeVisible();
    await expect(page.getByText("Qtangl", { exact: true }).first()).toBeVisible();
    await expect(page.locator("#matrix").getByRole("link", { name: "SandboxAQ" })).toBeVisible();
    await expect(page.getByText("Individual comparisons")).toBeVisible();
  });

  test("matrix filters via ids query param", async ({ page }) => {
    await page.goto("/compare?ids=sandboxaq,keyfactor");
    await expect(
      page.locator("#matrix table").first().getByRole("columnheader", { name: "SandboxAQ" }),
    ).toBeVisible();
    await expect(
      page.locator("#matrix table").first().getByRole("columnheader", { name: "Keyfactor" }),
    ).toBeVisible();
  });

  test("spoke page renders radar and win/lose", async ({ page }) => {
    await page.goto("/compare/qtangl-vs-sandboxaq");
    await expect(page.getByRole("heading", { name: /Qtangl vs SandboxAQ/i }).first()).toBeVisible();
    await expect(page.getByText("Where Qtangl wins")).toBeVisible();
    await expect(page.getByText("Where SandboxAQ wins")).toBeVisible();
    await expect(page.getByText("Capability radar")).toBeVisible();
  });

  test("guide capture form is present", async ({ page }) => {
    await page.goto("/compare#guide");
    await expect(page.getByText("PQC Vendor Comparison Guide (PDF)")).toBeVisible();
    await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  });
});
