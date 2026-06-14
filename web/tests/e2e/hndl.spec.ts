import { expect, test } from "@playwright/test";

const hndlRoutes = [
  { path: "/q-day/hndl", heading: /Harvest now, decrypt later/i },
  { path: "/blog/how-encrypted-data-is-harvested", heading: /How encrypted data is harvested/i },
  { path: "/blog/hndl-myths-misconceptions", heading: /HNDL myths/i },
  { path: "/blog/harvest-now-decrypt-later-boards", heading: /what boards miss/i },
  { path: "/blog/hndl-for-security-engineers", heading: /HNDL for security engineers/i },
  { path: "/q-day/frameworks/banking-hndl", heading: /Banking.*harvest/i },
  { path: "/q-day/frameworks/gov-hndl", heading: /Gov contractor.*harvest/i },
];

test.describe("HNDL education hub", () => {
  for (const route of hndlRoutes) {
    test(`${route.path} renders hero and CTA`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
      await expect(
        page.getByRole("link", { name: /mini-assessment|Run Q-Day|assess/i }).first(),
      ).toBeVisible();
    });
  }

  test("HNDL hub shows exposure estimator and Mosca calculator", async ({ page }) => {
    await page.goto("/q-day/hndl");
    await expect(page.getByText(/Are you exposed/i)).toBeVisible();
    await expect(page.getByText(/Mosca calculator/i)).toBeVisible();
    await expect(page.getByText("Collection vectors", { exact: true })).toBeVisible();
  });

  test("Mosca calculator updates verdict", async ({ page }) => {
    await page.goto("/q-day/hndl");
    const dataInput = page.getByRole("spinbutton", { name: "Data shelf-life in years" });
    await dataInput.fill("40");
    await expect(page.getByText(/HNDL exposure today/i).first()).toBeVisible();
  });

  test("Exposure estimator changes with industry", async ({ page }) => {
    await page.goto("/q-day/hndl");
    await page.getByLabel(/Industry or data type/i).selectOption("banking");
    await expect(page.getByText(/Inequality/i).first()).toBeVisible();
  });

  test("Exposure estimator on banking framework page", async ({ page }) => {
    await page.goto("/q-day/frameworks/banking-hndl");
    await expect(page.getByText(/Are you exposed/i)).toBeVisible();
    await expect(page.getByLabel(/Industry or data type/i)).toHaveValue("banking");
  });
});
