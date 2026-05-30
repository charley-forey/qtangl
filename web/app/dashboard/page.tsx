import type { Metadata } from "next";

import DashboardClient from "@/components/dashboard/DashboardClient";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/dashboard",
  title: "Tenant dashboard",
  description: "View persisted PQC scans and download compliance reports for your Qtangl tenant.",
});

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pilot access"
        title="Tenant dashboard"
        description="Connect with your tenant API key to review scan history and download report packs from persisted storage."
      />
      <Section gap="tight">
        <DashboardClient />
      </Section>
    </PageShell>
  );
}
