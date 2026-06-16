"use client";

import type { ReactNode } from "react";

import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";

export default function DashboardPageShell({ children }: { children: ReactNode }) {
  const { session, checked } = useDashboardSession();

  if (!checked) {
    return <p className="text-sm text-[var(--color-gray-500)]">Loading workspace…</p>;
  }

  if (session) {
    return (
      <div className="space-y-6">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/20 px-6 py-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
            Workspace
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            {session.tenantName ?? session.tenantId}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-gray-400)]">
            {session.email} · {session.role}
          </p>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
