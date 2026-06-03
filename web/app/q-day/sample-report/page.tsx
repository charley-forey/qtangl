import type { Metadata } from "next";
import Link from "next/link";

import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/q-day/sample-report",
  title: "Sample Q-Day readiness report",
  description:
    "Preview a redacted Qtangl assessment report — readiness score, findings, and independent verify flow.",
});

export default function SampleReportPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Sample artifact"
        title="Redacted Q-Day readiness report"
        description="See the structure of a Qtangl Assess deliverable — readiness score, prioritized findings, framework crosswalk, and signed verify link."
        actions={[
          { href: "/verify?token=sample-token", label: "Verify sample report" },
          { href: "/assess", label: "Run your own scan", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <Card tone="feature" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Report sections</Eyebrow>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Executive summary with readiness score and band</li>
            <li>Quantum-vulnerable TLS inventory with algorithm tags</li>
            <li>Mosca HNDL exposure summary</li>
            <li>Framework mapping (NSM-10, CNSA 2.0, NIST IR 8547, CMMC, PCI-DSS 4.0)</li>
            <li>Prioritized remediation backlog</li>
            <li>CycloneDX CBOM export reference</li>
            <li>Signed PDF with independent verify URL</li>
          </ul>
        </Card>
      </Section>

      <Section gap="tight">
        <ContentQualityStrip />
      </Section>

      <Section gap="tight" className="pb-0">
        <p className="text-sm text-[var(--color-gray-400)]">
          Verify the sample signature at{" "}
          <Link href="/verify?token=sample-token" className="text-white underline underline-offset-4">
            /verify?token=sample-token
          </Link>
          . Run a live assessment at{" "}
          <Link href="/assess" className="text-white underline underline-offset-4">
            /assess
          </Link>{" "}
          to export your own signed report.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/assess/mini">Free mini-assessment</Button>
          <Button href="/samples/sample-cbom-bank-tls-inventory.json" variant="secondary">
            Download sample CBOM
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
