"use client";

import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";

export default function DashboardPageShell({ children }: { children: ReactNode }) {
  const { session, checked, workosEnabled } = useDashboardSession();

  if (!checked) {
    return <p className="text-sm text-[var(--color-gray-500)]">Loading workspace…</p>;
  }

  if (session) {
    return (
      <div className="space-y-6">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/20 px-6 py-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
            Welcome back
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {session.tenantName ?? session.tenantId}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            {session.email} · {session.role}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="#run-baseline" size="sm">
              Run baseline scan
            </Button>
            <Button href="#dashboard-tabs" variant="secondary" size="sm">
              View scans
            </Button>
            <Button href="#dashboard-settings" variant="secondary" size="sm">
              Team settings
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-feature)] border border-[var(--border-subtle)] bg-gradient-to-br from-white/[0.04] to-transparent px-6 py-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
          Q-Day command center
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white">
          Sign in to your post-quantum workspace
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)]">
          Review scan history, crypto drift, readiness trends, scheduled monitoring, and remediation —
          with signed evidence exports for board and audit.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {workosEnabled ? (
            <Button href="/dashboard/login" size="sm">
              Sign in
            </Button>
          ) : null}
          <Button href="/assess" variant="secondary" size="sm">
            Try public assess demo
          </Button>
          <Button href="/access" variant="secondary" size="sm">
            Request pilot
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
