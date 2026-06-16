"use client";

import type { ReactNode } from "react";

import type { DashboardSummary } from "@/lib/dashboard-state";
import { isWidgetHidden } from "@/lib/dashboard-state";
import type { RolePolicy } from "@/lib/dashboard-role-policies";
import { widgetAllowed } from "@/lib/dashboard-role-policies";

export default function DashboardWidgetGate({
  widgetId,
  layout,
  rolePolicy,
  children,
}: {
  widgetId: string;
  layout: DashboardSummary["layoutDefaults"];
  rolePolicy?: RolePolicy;
  children: ReactNode;
}) {
  if (isWidgetHidden(layout, widgetId)) {
    return null;
  }
  if (rolePolicy && !widgetAllowed(rolePolicy, widgetId)) {
    return null;
  }
  return <>{children}</>;
}
