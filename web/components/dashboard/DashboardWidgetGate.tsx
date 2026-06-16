"use client";

import type { ReactNode } from "react";

import type { DashboardSummary } from "@/lib/dashboard-state";
import { isWidgetHidden } from "@/lib/dashboard-state";

export default function DashboardWidgetGate({
  widgetId,
  layout,
  children,
}: {
  widgetId: string;
  layout: DashboardSummary["layoutDefaults"];
  children: ReactNode;
}) {
  if (isWidgetHidden(layout, widgetId)) {
    return null;
  }
  return <>{children}</>;
}
