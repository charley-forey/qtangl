"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DashboardLanding from "@/components/dashboard/DashboardLanding";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import DashboardSessionError from "@/components/dashboard/DashboardSessionError";
import { legacyKeyClientEnabled } from "@/lib/dashboard-bff";

export default function DashboardAuthGate({
  children,
  requireSso,
}: {
  children: React.ReactNode;
  requireSso: boolean;
}) {
  const { session, checked, workosEnabled, sessionReason } = useDashboardSession();

  if (!checked) {
    return <p className="text-sm text-[var(--color-gray-500)]">Checking session…</p>;
  }

  if (session) {
    return <>{children}</>;
  }

  if (sessionReason) {
    return (
      <DashboardSessionError reason={sessionReason} workosEnabled={workosEnabled} />
    );
  }

  const ssoRequired = requireSso;

  if (ssoRequired && workosEnabled) {
    return (
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Enterprise SSO required</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-300)]">
          This organization requires SSO for dashboard access.
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

  if (workosEnabled && !legacyKeyClientEnabled()) {
    return <DashboardLanding />;
  }

  if (workosEnabled) {
    return (
      <div className="space-y-6">
        <DashboardLanding />
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
