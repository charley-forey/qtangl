"use client";

export function trackDashboardEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  const posthog = (window as Window & { posthog?: { capture: (e: string, p?: object) => void } })
    .posthog;
  posthog?.capture(event, properties);

  void fetch("/api/dashboard/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ event, properties: properties ?? {} }),
  })
    .then((response) => {
      if (!response.ok) {
        return;
      }
    })
    .catch(() => {
      /* analytics must not block UX */
    });
}

export function identifyDashboardTenant(tenantId: string, traits?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !tenantId) return;
  const posthog = (
    window as Window & {
      posthog?: {
        identify: (id: string, props?: Record<string, string | number | boolean>) => void;
      };
    }
  ).posthog;
  posthog?.identify(tenantId, traits);
}
