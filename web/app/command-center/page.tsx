import type { Metadata } from "next";
import { Suspense } from "react";

import DashboardAuthGate from "@/components/dashboard/DashboardAuthGate";
import DashboardClient from "@/components/dashboard/DashboardClient";
import DashboardPageShell from "@/components/dashboard/DashboardPageShell";
import { dashboardRequireSso } from "@/lib/auth/workos";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/command-center",
  title: "Command Center",
  description:
    "Scheduled re-scans, crypto drift alerts, readiness trends, and remediation tracking for your Qtangl tenant.",
  noIndex: true,
});

export default function DashboardPage() {
  return (
    <PageShell>
      <Section gap="tight" className="pb-0 pt-6">
        <DashboardPageShell>
          <DashboardAuthGate requireSso={dashboardRequireSso()}>
            <Suspense fallback={<p className="text-sm text-[var(--color-gray-500)]">Loading Command Center…</p>}>
              <DashboardClient />
            </Suspense>
          </DashboardAuthGate>
        </DashboardPageShell>
      </Section>
    </PageShell>
  );
}
