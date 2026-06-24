import type { Page, Route } from "@playwright/test";

export type DashboardSessionMock = {
  email: string;
  tenantId: string;
  tenantName: string;
  role: string;
  userId: string;
  memberships?: Array<{ tenantId: string; tenantName: string; role: string }>;
  capabilities?: {
    canAdmin: boolean;
    canWrite: boolean;
    canViewCompliance: boolean;
    canManageKeys?: boolean;
    canInvite?: boolean;
  };
};

function defaultCapabilities(role: string) {
  const canAdmin = role === "admin" || role === "partner_admin";
  const canWrite = canAdmin || role === "operator" || role === "partner_analyst";
  return {
    canAdmin,
    canWrite,
    canViewCompliance: true,
    canManageKeys: canAdmin,
    canInvite: canAdmin,
  };
}

/** Mock WorkOS BFF session and legacy /api/auth/session fallback for dashboard E2E. */
export async function mockDashboardSession(page: Page, session: DashboardSessionMock) {
  const memberships =
    session.memberships ?? [{ tenantId: session.tenantId, tenantName: session.tenantName, role: session.role }];
  const capabilities = session.capabilities ?? defaultCapabilities(session.role);

  const mePayload = {
    authenticated: true,
    authMethod: "workos",
    credentialsReady: true,
    session: {
      email: session.email,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      role: session.role,
      userId: session.userId,
      memberships,
    },
    capabilities,
  };

  const legacyPayload = {
    authenticated: true,
    session: {
      email: session.email,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      role: session.role,
      userId: session.userId,
    },
  };

  await page.route("**/api/dashboard/me", async (route: Route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mePayload),
    });
  });

  await page.route("**/api/auth/session", async (route: Route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(legacyPayload),
    });
  });
}

export async function mockDashboardEvents(page: Page) {
  await page.route("**/api/dashboard/events", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/event-stream", body: ":ok\n\n" });
  });
}

export async function mockDashboardTenantRoutes(
  page: Page,
  handlers: {
    summary?: unknown;
    tabRoutes?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  }
) {
  await page.route("**/api/dashboard/tenant/**", async (route) => {
    const url = route.request().url();
    if (handlers.summary && url.includes("/tenant/dashboard/summary")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(handlers.summary),
      });
    }
    if (handlers.tabRoutes) {
      for (const [tab, payload] of Object.entries(handlers.tabRoutes)) {
        if (url.includes(`/tenant/dashboard/tab/${tab}`)) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: payload }),
          });
        }
      }
    }
    if (handlers.settings && url.includes("/tenant/settings")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ settings: handlers.settings }),
      });
    }
    if (url.includes("/tenant/scans/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          scanId: "scan-1",
          jobStatus: "done",
          readinessScore: 78,
          report: { honestyNotes: [] },
        }),
      });
    }
    if (url.includes("/tenant/alerts")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ alerts: [] }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "success" }) });
  });
}
