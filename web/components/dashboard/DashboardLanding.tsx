"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DashboardOnboarding from "@/components/dashboard/DashboardOnboarding";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import { legacyKeyClientEnabled } from "@/lib/dashboard-bff";

export default function DashboardLanding() {
  const { session, workosEnabled } = useDashboardSession();
  const showLegacyHint = !session && legacyKeyClientEnabled();

  return (
    <div className="space-y-6">
      <DashboardOnboarding />
      {workosEnabled && !session ? (
        <Card tone="strong" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Get started</Eyebrow>
          <p className="mt-3 text-sm text-[var(--color-gray-300)]">
            Sign in with your work email or enterprise SSO. Your team admin can invite colleagues from
            Settings after the first login.
          </p>
          <Button href="/command-center/login" className="mt-4">
            Sign in to workspace
          </Button>
        </Card>
      ) : null}
      {showLegacyHint ? (
        <p className="text-xs text-[var(--color-gray-500)]">
          Automation API keys are available under Settings → Advanced after sign-in.
        </p>
      ) : null}
    </div>
  );
}
