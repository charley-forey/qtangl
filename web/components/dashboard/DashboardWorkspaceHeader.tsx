"use client";

import TenantSwitcher from "@/components/dashboard/TenantSwitcher";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import type { DashboardSession } from "@/lib/dashboard-bff";
import { isQtanglOpsFromSessionEmail } from "@/lib/ops-auth";

export default function DashboardWorkspaceHeader({
  tier,
  membershipHealth,
  onSessionChange,
}: {
  tier?: string;
  membershipHealth?: Array<{ tenantId: string; latestReadinessBand?: string | null }>;
  onSessionChange?: (session: DashboardSession) => void;
}) {
  const { session, signOut } = useDashboardSession();
  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-black/25 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <TenantSwitcher
          session={session}
          membershipHealth={membershipHealth}
          onSwitched={(next) => {
            if (next) onSessionChange?.(next);
          }}
        />
        {tier ? <StatusPill label={tier} tone="info" /> : null}
        <StatusPill label={session.role} />
      </div>
      <div className="flex items-center gap-3 text-xs text-[var(--color-gray-400)]">
        {isQtanglOpsFromSessionEmail(session.email) ? (
          <a href="/ops" className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-white hover:bg-white/5">
            Ops console
          </a>
        ) : null}
        <span>{session.email}</span>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-white hover:bg-white/5"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
