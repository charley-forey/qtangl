"use client";

import { useReportWebVitals } from "next/web-vitals";

type GtagFn = (
  command: string,
  eventName: string,
  params: Record<string, string | number | boolean>
) => void;

type PostHogClient = {
  capture?: (event: string, properties: Record<string, string | number>) => void;
};

export default function WebVitals() {
  useReportWebVitals((metric) => {
    const value = Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value);

    const gtag = (window as Window & { gtag?: GtagFn }).gtag;
    gtag?.("event", metric.name, {
      value,
      metric_id: metric.id,
      metric_rating: metric.rating,
      non_interaction: true,
    });

    const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
    posthog?.capture?.("web_vital", {
      name: metric.name,
      value,
      id: metric.id,
      rating: metric.rating,
    });
  });

  return null;
}
