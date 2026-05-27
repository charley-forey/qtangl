declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    posthog?: { capture: (eventName: string, props?: Record<string, unknown>) => void };
  }
}

export function trackEvent(eventName: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.gtag?.("event", eventName, props);
    window.posthog?.capture(eventName, props);
    window.plausible?.(eventName, props ? { props } : undefined);
  } catch {
    // Analytics must never block the demo.
  }
}
