"use client";

import type { ReactNode } from "react";

import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";

/** Lightweight wrapper — session UI lives in DashboardClient / NavbarAccountMenu. */
export default function DashboardPageShell({ children }: { children: ReactNode }) {
  const { checked } = useDashboardSession();

  if (!checked) {
    return <p className="text-sm text-[var(--color-gray-500)]">Loading workspace…</p>;
  }

  return <>{children}</>;
}
