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
      <div className="hidden items-center gap-2 lg:flex">
        <a
          href="/dashboard"
          className="text-sm text-[var(--color-gray-300)] transition hover:text-white"
        >
          {session.tenantName ?? "Dashboard"}
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
      href="/dashboard/login"
      className="hidden text-sm font-medium text-[var(--color-gray-300)] transition hover:text-white lg:inline-block"
    >
      Sign in
    </a>
  );
}
