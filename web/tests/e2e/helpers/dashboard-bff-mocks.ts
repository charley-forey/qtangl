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

export async function mockDashboardQrosRoutes(page: Page) {
  let nbaSnoozed = false;
  const nextActions = {
    actions: [
      {
        id: "nba-test-1",
        kind: "schedule",
        title: "Enable weekly monitor cadence",
        impact: "Keeps inventory evidence fresh between audits.",
        effort: "low",
        score: 0.9,
        deepLink: "/command-center?tab=monitor",
        cta: { label: "Open monitor" },
      },
    ],
  };

  const briefing = {
    persona: "operator",
    headline: "Portfolio readiness is stable at 78.",
    bullets: ["1 open critical finding needs owner assignment.", "Next scheduled scan in 7 days."],
    methodNote: "Inventory aid — not a formal audit.",
  };

  await page.route("**/api/dashboard/tenant/qros/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (url.endsWith("/qros/push-briefing") && method === "GET") {
      return route.fulfill({ json: {
        channels: ["email"], recipients: [], cadenceHours: 24, enabled: false,
        firstRunAt: null, requiresSave: false, lastDelivery: null,
      } });
    }
    if (url.includes("/next-actions") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(nbaSnoozed ? { actions: [] } : nextActions),
      });
    }
    if (url.includes("/next-actions") && url.includes("/mutate") && method === "POST") {
      nbaSnoozed = true;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "ok" }) });
    }
    if (url.includes("/morning-briefing")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(briefing) });
    }
    if (url.includes("/runway")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          framing: "Migration runway — not Q-Day prediction.",
          milestones: [{ id: "m1", date: "Q3 2026", label: "Inventory complete", description: "Baseline signed." }],
          scenarios: [{ id: "accelerate", label: "Accelerate TLS" }],
        }),
      });
    }
    if (url.includes("/marketplace/tiles")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tiles: [{ id: "tile-1", name: "MSSP overlay", publisher: "Partner", category: "monitoring", description: "Test tile", installed: false }],
        }),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "success" }) });
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
    if (url.includes("/tenant/qros/")) {
      return route.continue();
    }
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
    if (url.includes("/tenant/war-rooms")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "success" }) });
  });
}
