"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { navigateDashboardDeepLink } from "@/lib/dashboard-deep-links";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function DrillLink({
  href,
  tab,
  metric,
  children,
  className = "",
  onClick,
}: {
  href: string;
  tab?: string;
  metric?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={`block w-full cursor-pointer text-left ${className}`}
      onClick={() => {
        if (metric && tab) {
          trackDashboardEvent({
            event: "cc_metric_drilled",
            properties: { metric, tab, target: href },
          });
        }
        onClick?.();
        navigateDashboardDeepLink(href, router);
      }}
    >
      {children}
    </button>
  );
}
