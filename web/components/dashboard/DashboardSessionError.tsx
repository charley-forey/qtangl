"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import type { DashboardMeResponse } from "@/lib/dashboard-bff";

const REASON_COPY: Record<
  NonNullable<DashboardMeResponse["reason"]>,
  { title: string; body: string; cta?: { label: string; href: string } }
> = {
  no_membership: {
    title: "No workspace linked",
    body: "Your account signed in successfully, but no organization membership was found. Sign out, then use Sign in to get started again — first login now auto-creates a free workspace. Or ask your admin for an invite.",
    cta: { label: "Sign in again", href: "/dashboard/login" },
  },
  bff_secret_missing: {
    title: "Dashboard auth misconfigured",
    body: "The workspace API session could not be established. Ensure QTANGL_BFF_SESSION_SECRET is set on Railway and Vercel with the same value, then sign out and sign in again.",
    cta: { label: "Check auth health", href: "/api/dashboard/auth-health" },
  },
  database_unavailable: {
    title: "Maintenance in progress",
    body: "The workspace database is temporarily unavailable. Try again in a few minutes.",
  },
  workos_user_missing: {
    title: "Sign in required",
    body: "Sign in with your organization account to access the dashboard.",
    cta: { label: "Sign in", href: "/dashboard/login" },
  },
};

function formatSummaryError(message: string): string {
  if (message.includes("Missing credentials")) {
    return "Your sign-in succeeded, but workspace API cookies were not sent to the server. Sign out, sign in again, then open /api/dashboard/session-debug — credentialsReady should be true and summaryOk true. Also confirm QTANGL_BFF_SESSION_SECRET is set on Railway (same value as Vercel) so the API can verify session cookies.";
  }
  if (
    message.includes("401") ||
    message.includes("403") ||
    message.includes("503") ||
    message.includes("Unable to load") ||
    message.includes("summary failed")
  ) {
    return "Your session cookies are set, but the workspace summary API returned an error. Open /api/dashboard/session-debug and check summaryStatus, assertionSummaryOk, and sessionKeySummaryOk. If sessionKeySummaryOk is true but assertionSummaryOk is false, sign out and sign in again. If both fail, confirm QTANGL_BFF_SESSION_SECRET matches on Vercel and Railway and redeploy both.";
  }
  return message;
}

function SignOutButton() {
  const { signOut } = useDashboardSession();
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="touch-target relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full border border-[var(--border)] bg-white/[0.02] px-4 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white/[0.05]"
    >
      Sign out
    </button>
  );
}

export default function DashboardSessionError({
  reason,
  summaryError,
  workosEnabled,
}: {
  reason?: DashboardMeResponse["reason"];
  summaryError?: string | null;
  workosEnabled?: boolean;
}) {
  if (summaryError) {
    return (
      <Card tone="ghost" className="border border-red-500/40">
        <Eyebrow>Unable to load workspace</Eyebrow>
        <p className="mt-3 text-sm text-red-200">{formatSummaryError(summaryError)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/api/dashboard/session-debug" variant="secondary" size="sm">
            Session debug
          </Button>
          <Button href="/api/dashboard/auth-health" variant="secondary" size="sm">
            Auth diagnostics
          </Button>
          <SignOutButton />
          {workosEnabled ? (
            <Button href="/dashboard/login" size="sm">
              Sign in again
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }

  if (!reason) {
    return null;
  }

  const copy = REASON_COPY[reason];
  return (
    <Card tone="ghost" className="border border-amber-500/40">
      <Eyebrow>Workspace access</Eyebrow>
      <h2 className="mt-2 text-lg font-semibold text-white">{copy.title}</h2>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">{copy.body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {copy.cta ? (
          <Button href={copy.cta.href} size="sm">
            {copy.cta.label}
          </Button>
        ) : null}
        <SignOutButton />
        <Button href="/api/dashboard/auth-health" variant="secondary" size="sm">
          Auth diagnostics
        </Button>
      </div>
    </Card>
  );
}
