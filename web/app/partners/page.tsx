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

const programTiers = [
  {
    name: "Registered",
    description: "Co-marketing, demo tenant, and Monitor delivery playbook.",
  },
  {
    name: "Advanced",
    description: "Parent-child tenant API, portfolio command center, webhook v2 + SIEM mapping.",
  },
  {
    name: "Premier",
    description: "Joint QBR templates, readiness index benchmarks (opt-in), dedicated CS liaison.",
  },
] as const;

export default function PartnersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Partners"
        title="Deliver Q-Day readiness at scale"
        description="Parent-child tenancy, portfolio command center, and co-branded signed reports for MSSPs and consultancies."
        actions={[
          { href: "/access", label: "Apply for partner access" },
          { href: "/docs/integrations/siem-webhook-v2", label: "SIEM integration", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <Eyebrow>Program tiers</Eyebrow>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {programTiers.map((tier) => (
            <Card key={tier.name} tone="panel" className="p-6">
              <p className="text-sm font-semibold text-white">{tier.name}</p>
              <p className="mt-3 text-sm text-[var(--muted)]">{tier.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="grid gap-6 md:grid-cols-2">
          <Card tone="panel" className="p-6">
            <Eyebrow>MSSP delivery</Eyebrow>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Link child tenants via <code className="text-xs">POST /tenant/partner/children</code>, roll up readiness by
              business unit, and standardize Monitor schedules across clients.
            </p>
          </Card>
          <Card tone="panel" className="p-6">
            <Eyebrow>Technology alliances</Eyebrow>
            <p className="mt-3 text-sm text-[var(--muted)]">
              GitHub Action regression gate, webhooks v2 with HMAC signing, and Splunk/Sentinel field mapping for integrated
              delivery.
            </p>
          </Card>
        </div>
        <p className="mt-6 text-xs text-[var(--color-gray-500)]">
          Partner portal UI is on the roadmap — today partners operate via API + dashboard.{" "}
          <Link href="/trust/subprocessors" className="text-white underline">
            Sub-processors
          </Link>{" "}
          and{" "}
          <Link href="/trust/security" className="text-white underline">
            security architecture
          </Link>{" "}
          support enterprise diligence.
        </p>
        <div className="mt-8">
          <Button href="/access">Apply for partner access</Button>
        </div>
      </Section>
    </PageShell>
  );
}
