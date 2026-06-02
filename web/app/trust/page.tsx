import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import ReferencesPanel from "@/components/pqc/ReferencesPanel";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { valueProofItems } from "@/lib/copy/readiness-value";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust",
  title: "Qtangl Trust Center",
  description: "Data handling, retention, report integrity, and security practices for Qtangl Q-Day readiness scans.",
});

const trustSections = [
  {
    title: "Data handling",
    body: (
      <>
        Scan results are stored per tenant when Postgres persistence is enabled. You may delete scans via{" "}
        <code className="text-white">DELETE /tenant/scans/&#123;id&#125;</code>. Tenant API keys are hashed at
        rest; revoke leaked keys immediately via admin.
      </>
    ),
  },
  {
    title: "Report integrity",
    body: (
      <>
        Each migration report includes a SHA-256 content hash and signature (ML-DSA-65 when liboqs is available,
        Ed25519 fallback otherwise). Verify independently at{" "}
        <Link href="/verify" className="text-white underline underline-offset-4">
          /verify
        </Link>
        .
      </>
    ),
  },
  {
    title: "Honest scope",
    body: (
      <>
        Qtangl provides cryptographic inventory and prioritization — an inventory aid, not a formal audit or
        attestation. Findings should be validated in your environment before regulatory submission.
      </>
    ),
  },
  {
    title: "Retention",
    body: (
      <>
        Upload bundle sessions expire after 24 hours. Scan job retention follows your deployment configuration;
        contact Qtangl for enterprise data-residency and custom retention windows.
      </>
    ),
  },
  {
    title: "Monitoring & alerts",
    body: (
      <>
        Monitor tier supports scheduled re-scans, drift diffs, and webhook notifications on scan completion. Webhook
        payloads use schema version <code className="text-white">qtangl-webhook-v2</code> for SIEM ingestion.
        Optional HMAC signing via <code className="text-white">X-Qtangl-Signature</code> when a tenant signing secret
        is configured. Failed deliveries are retained in a Postgres-backed DLQ with dashboard replay.
      </>
    ),
  },
  {
    title: "Sub-processors",
    body: (
      <>
        Production deploys may use Railway (hosting), Postgres (data), Redis (queue), Stripe (billing), and optional
        email delivery. Enterprise customers receive a current sub-processor list during contract review.
      </>
    ),
  },
  {
    title: "SOC 2 & compliance",
    body: (
      <>
        SOC 2 Type I scope is documented internally; we do not claim certification on marketing pages until complete.
        GRC framework mappings (NIST CSF, EU PQC guidance) are provided as readiness aids via the compliance posture API.
      </>
    ),
  },
  {
    title: "DPA requests",
    body: (
      <>
        Request a Data Processing Agreement via{" "}
        <Link href="/access" className="text-white underline underline-offset-4">
          Contact sales
        </Link>{" "}
        — include entity name, data residency requirements, and expected scan volume.
      </>
    ),
  },
  {
    title: "Dogfood verification",
    body: (
      <>
        Qtangl signs its own scan reports and publishes verification steps at{" "}
        <Link href="/verify" className="text-white underline underline-offset-4">
          /verify
        </Link>
        . We recommend customers verify a sample report before production rollout.
      </>
    ),
  },
];

export default function TrustPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Trust Center"
        title="Security, privacy, and report integrity"
        description="How Qtangl handles scan data, signs reports, and supports enterprise retention controls."
        actions={[
          { label: "Security architecture", href: "/trust/security" },
          { label: "Sub-processors", href: "/trust/subprocessors" },
          { href: "/status", label: "System status" },
          { href: "/verify", label: "Verify a report" },
          { href: "/docs/operations/security", label: "Security docs", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProofItems.map((item) => (
            <Card key={item.title} tone="ghost" className="rounded-[var(--radius-xl)]">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-gray-400)]">{item.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          {trustSections.map((section) => (
            <section key={section.title}>
              <Eyebrow>{section.title}</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">{section.body}</p>
            </section>
          ))}
          <ReferencesPanel />
          <div className="flex flex-wrap gap-3 border-t border-[var(--border-subtle)] pt-8">
            <Button href="/access">Request enterprise pilot</Button>
            <Button href="/docs/operations/security" variant="secondary">
              Security documentation
            </Button>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
