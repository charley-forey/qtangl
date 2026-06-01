/** PRD telemetry hooks — wire to PostHog when NEXT_PUBLIC_POSTHOG_KEY is set. */

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[telemetry]", name, properties);
    }
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posthog = (window as any).posthog;
  if (posthog?.capture) {
    posthog.capture(name, properties);
  }
}
