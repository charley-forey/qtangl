import { expect, type Page } from "@playwright/test";

/** Wait for the client-loaded assess scanner (dynamic import, no SSR). */
export async function waitForAssessScanner(page: Page) {
  await expect(
    page
      .getByRole("heading", { name: /What do you want to do/i })
      .or(page.getByRole("tab", { name: "Executive" }))
  ).toBeVisible({ timeout: 30_000 });
}

export async function gotoAssessScanner(page: Page) {
  await page.goto("/assess");
  await waitForAssessScanner(page);
}

export async function gotoAssessAutorun(page: Page, query: string) {
  const params = new URLSearchParams(query);
  params.set("intent", "sample");
  params.set("useFixture", "true");
  await page.goto(`/assess?${params}`);
  await expect(page.getByRole("tab", { name: "Executive" })).toBeVisible({ timeout: 30_000 });
}
