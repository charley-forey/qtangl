import { test, expect } from "@playwright/test";

test.describe("Dashboard sign out", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/dashboard/sign-out", async (route) => {
      const headers: Record<string, string> = {
        Location: "/dashboard/login",
        "Set-Cookie": [
          "qtangl_session_assertion=; Path=/; Max-Age=0",
          "qtangl_session_key=; Path=/; Max-Age=0",
          "qtangl_active_tenant=; Path=/; Max-Age=0",
          "wos-session=; Path=/; Max-Age=0",
        ].join(", "),
      };
      await route.fulfill({
        status: 302,
        headers,
      });
    });
  });

  test("sign out from navbar clears session UI", async ({ page }) => {
    let meCalls = 0;

    await page.route("**/api/dashboard/me", async (route) => {
      if (route.request().method() === "GET") {
        meCalls += 1;
        if (meCalls === 1) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              authenticated: true,
              authMethod: "workos",
              credentialsReady: true,
              session: {
                email: "admin@test.com",
                tenantId: "tenant-test",
                tenantName: "Test Co",
                role: "admin",
                userId: "user-1",
              },
              capabilities: { canAdmin: true, canWrite: true, canInvite: true, canManageKeys: true, canViewCompliance: true },
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ authenticated: false, reason: "workos_user_missing" }),
        });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/dashboard/tenant/dashboard/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          me: { tenantId: "tenant-test", role: "admin", entitlements: { tier: "monitor" } },
          kpis: { latestReadiness: 78 },
          trend: [],
          digest: null,
          commandCenter: null,
          alerts: [],
          recentScans: [],
          schedulesSummary: { active: 0 },
          health: {},
          latestScanDetail: null,
          layoutDefaults: { persona: "operator", pinned: [], hidden: [] },
          membershipHealth: [],
        }),
      });
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/dashboard/login**");
  });
});
