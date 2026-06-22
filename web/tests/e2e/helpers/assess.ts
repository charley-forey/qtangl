import { expect, type Page } from "@playwright/test";

/** Wait for the client-loaded assess scanner (dynamic import, no SSR). */
export async function waitForAssessScanner(page: Page) {
  await expect(
    page
      .getByRole("heading", { name: /What do you want to do/i })
      .or(page.getByRole("tab", { name: "Executive" }))
  ).toBeVisible({ timeout: 90_000 });
}

export async function gotoAssessScanner(page: Page) {
  await page.goto("/assess");
  await waitForAssessScanner(page);
}

export async function gotoAssessAutorun(page: Page, query: string) {
  await page.goto(`/assess?${query}`);
  await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 90_000 });
}
