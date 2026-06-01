import type { Metadata } from "next";

import DashboardAuthGate from "@/components/dashboard/DashboardAuthGate";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { dashboardRequireSso, oidcConfigured } from "@/lib/auth/oidc";
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
});

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Monitor + Convert"
        title="Your Q-Day command center"
        description="Connect with your tenant API key to review scan history, drift diffs, readiness trends, scheduled monitoring, and remediation workflow."
        actions={[
          { href: "/demo/pqc", label: "Run a scan first" },
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
        <DashboardAuthGate ssoConfigured={oidcConfigured()} requireSso={dashboardRequireSso()}>
          <DashboardClient />
        </DashboardAuthGate>
      </Section>
    </PageShell>
  );
}
