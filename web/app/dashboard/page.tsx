import type { Metadata } from "next";
import { Suspense } from "react";

import DashboardAuthGate from "@/components/dashboard/DashboardAuthGate";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { dashboardRequireSso } from "@/lib/auth/workos";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/dashboard",
  title: "Q-Day Monitor Dashboard",
  description:
    "Scheduled re-scans, crypto drift alerts, readiness trends, and remediation tracking for your Qtangl tenant.",
  noIndex: true,
});

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Monitor + Convert"
        title="Your Q-Day command center"
        description="Sign in to your workspace to review scan history, drift diffs, readiness trends, scheduled monitoring, and remediation workflow."
        actions={[
          { href: "/assess", label: "Run a scan first" },
          { href: "/access", label: "Request pilot", variant: "secondary" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <div className="mb-6 flex flex-wrap gap-3">
          <Button href="/monitor" variant="secondary" size="sm">
            Monitor tier overview
          </Button>
          <Button href="/convert" variant="secondary" size="sm">
            Convert tier overview
          </Button>
          <Button href="/verify" variant="secondary" size="sm">
            Verify a report
          </Button>
        </div>
        <DashboardAuthGate requireSso={dashboardRequireSso()}>
          <Suspense fallback={<p className="text-sm text-[var(--color-gray-500)]">Loading dashboard…</p>}>
            <DashboardClient />
          </Suspense>
        </DashboardAuthGate>
      </Section>
    </PageShell>
  );
}
