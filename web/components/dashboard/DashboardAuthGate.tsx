"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  fetchDashboardSession,
  legacyKeyClientEnabled,
  type DashboardSession,
  workosClientAuthEnabled,
} from "@/lib/dashboard-bff";

export default function DashboardAuthGate({
  children,
  requireSso,
}: {
  children: React.ReactNode;
  ssoConfigured?: boolean;
  requireSso: boolean;
}) {
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [checked, setChecked] = useState(false);
  const workosEnabled = workosClientAuthEnabled();
  const legacyEnabled = legacyKeyClientEnabled();

  const refreshSession = useCallback(async () => {
    if (!workosEnabled) {
      const legacy = await fetch("/api/auth/session").then((r) => r.json());
      if (legacy.authenticated && legacy.session) {
        setSession(legacy.session as DashboardSession);
      } else {
        setSession(null);
      }
      return;
    }
    const payload = await fetchDashboardSession();
    setSession(payload);
  }, [workosEnabled]);

  useEffect(() => {
    refreshSession().finally(() => setChecked(true));
  }, [refreshSession]);

  if (!checked) {
    return <p className="text-sm text-[var(--color-gray-500)]">Checking session…</p>;
  }

  const ssoRequired = requireSso || session?.authMode === "sso_required";

  if (ssoRequired && !session && workosEnabled) {
    return (
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Enterprise SSO required</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-300)]">
          This organization requires SSO for dashboard access. Automation API keys remain available via Settings
          after an admin signs in.
        </p>
        <a
          href="/dashboard/login"
          className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
        >
          Sign in with SSO
        </a>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {workosEnabled || session ? (
        <Card tone="ghost" className="border border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Eyebrow>Dashboard session</Eyebrow>
              {session ? (
                <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                  {session.email} · {session.tenantName ?? session.tenantId} · role {session.role}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-gray-400)]">
                  Sign in to your workspace to access scans, schedules, and team settings.
                </p>
              )}
            </div>
            {session ? (
              <button
                type="button"
                className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-xs text-white"
                onClick={() => {
                  const signOut = workosEnabled
                    ? () => fetch("/api/dashboard/me", { method: "DELETE" })
                    : () => fetch("/api/auth/session", { method: "DELETE" });
                  signOut().then(() => {
                    setSession(null);
                    window.location.reload();
                  });
                }}
              >
                Sign out
              </button>
            ) : (
              <a
                href="/dashboard/login"
                className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-medium text-black"
              >
                Sign in
              </a>
            )}
          </div>
        </Card>
      ) : null}
      {!session && workosEnabled && !legacyEnabled ? (
        <Card tone="strong" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Sign in required</Eyebrow>
          <p className="mt-3 text-sm text-[var(--color-gray-300)]">
            Connect your workspace with email magic link or enterprise SSO.
          </p>
          <a
            href="/dashboard/login"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
          >
            Sign in to dashboard
          </a>
        </Card>
      ) : (
        children
      )}
    </div>
  );
}
