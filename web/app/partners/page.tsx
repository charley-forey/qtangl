import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/partners",
  title: "Partner program | Qtangl",
  description: "MSSP and consulting partners — multi-tenant management for Q-Day readiness.",
});

export default function PartnersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Partners"
        title="Deliver Q-Day readiness at scale"
        description="Parent-child tenancy, portfolio command center, and co-branded reports for MSSPs and consultancies."
      />

      <Section gap="tight">
        <div className="grid gap-6 md:grid-cols-2">
          <Card tone="panel" className="p-6">
            <Eyebrow>MSSP</Eyebrow>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Link child tenants via API, roll up readiness by business unit, and standardize Monitor schedules.
            </p>
          </Card>
          <Card tone="panel" className="p-6">
            <Eyebrow>Technology</Eyebrow>
            <p className="mt-3 text-sm text-[var(--muted)]">
              GitHub Action, webhooks v2, and SIEM field mapping for integrated delivery.
            </p>
          </Card>
        </div>
        <div className="mt-8">
          <Button href="/access">Apply for partner access</Button>
        </div>
      </Section>
    </PageShell>
  );
}
