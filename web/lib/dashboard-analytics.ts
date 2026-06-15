"use client";

export function trackDashboardEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  const posthog = (window as Window & { posthog?: { capture: (e: string, p?: object) => void } })
    .posthog;
  posthog?.capture(event, properties);
}
