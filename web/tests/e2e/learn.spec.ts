import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("learn hub loads decision router", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByRole("heading", { name: /What are you trying to do/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Build circuits/i })).toBeVisible();
});

test("library filter URL roundtrip", async ({ page }) => {
  await page.goto("/learn/library?q=qiskit");
  await expect(page.getByPlaceholder(/Search Qiskit/i)).toHaveValue("qiskit");
});

test("compare URL preserves selection", async ({ page }) => {
  await page.goto("/learn/compare?ids=qiskit-qiskit,quantumlib-cirq");
  await expect(page.getByRole("columnheader", { name: "qiskit" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Cirq" })).toBeVisible();
});

test("library entry has substantive sections", async ({ page }) => {
  await page.goto("/learn/library/quantumlib-cirq");
  await expect(page.getByRole("heading", { name: "Cirq", level: 1 })).toBeVisible();
  await expect(page.getByText(/What it is/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Repository README/i })).toBeVisible();
});

test("learn pages pass basic axe scan", async ({ page }) => {
  await page.goto("/learn");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
