"use client";

import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import { workosClientAuthEnabled } from "@/lib/dashboard-bff";

export default function NavbarAccountMenu() {
  const workosEnabled = workosClientAuthEnabled();

  if (!workosEnabled) {
    return null;
  }

  return <NavbarAccountMenuInner />;
}

function NavbarAccountMenuInner() {
  const { session, checked, signOut } = useDashboardSession();

  if (!checked) {
    return null;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/command-center"
          className="hidden max-w-[10rem] truncate text-sm text-[var(--color-gray-300)] transition hover:text-white sm:inline-block lg:max-w-none"
        >
          {session.tenantName ?? "Command Center"}
        </a>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--color-gray-300)] hover:text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <a
      href="/command-center/login"
      className="text-sm font-medium text-[var(--color-gray-300)] transition hover:text-white"
    >
      Sign in
    </a>
  );
}

/** Mobile nav account row (sign in / sign out). */
export function NavbarMobileAccountActions({ onNavigate }: { onNavigate?: () => void }) {
  const workosEnabled = workosClientAuthEnabled();
  if (!workosEnabled) {
    return null;
  }
  return <NavbarMobileAccountActionsInner onNavigate={onNavigate} />;
}

function NavbarMobileAccountActionsInner({ onNavigate }: { onNavigate?: () => void }) {
  const { session, checked, signOut } = useDashboardSession();

  if (!checked) {
    return null;
  }

  if (session) {
    return (
      <div className="space-y-2">
        <p className="px-3 text-xs text-[var(--color-gray-500)]">
          {session.email} · {session.role}
        </p>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            signOut();
          }}
          className="touch-target block w-full rounded-xl border border-[var(--border)] px-3 py-3 text-left text-sm text-white hover:bg-white/[0.04]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <a
      href="/command-center/login"
      onClick={onNavigate}
      className="touch-target block rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-white hover:bg-white/[0.04]"
    >
      Sign in to Command Center
    </a>
  );
}
