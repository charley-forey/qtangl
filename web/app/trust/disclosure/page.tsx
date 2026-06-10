import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import {
  coordinatedDisclosureDays,
  disclosureAckSlaBusinessDays,
  disclosureRemediationSlas,
  mailtoSecurityReport,
  securityContactEmail,
  securityDisclosureSubject,
} from "@/lib/copy/trust";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust/disclosure",
  title: "Vulnerability disclosure | Qtangl Trust",
  description:
    "Qtangl coordinated vulnerability disclosure policy — scope, safe harbor, SLAs, and contact.",
});

export default function TrustDisclosurePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Trust Center"
        title="Vulnerability disclosure policy"
        description="How to report security issues in Qtangl products and infrastructure responsibly."
      />

      <Section gap="tight" className="mx-auto max-w-3xl space-y-6 text-sm leading-7 text-[var(--color-gray-300)]">
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Scope</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>qtangl.com and www.qtangl.com (marketing and dashboard web applications)</li>
            <li>api.qtangl.com (Qtangl API and scanner endpoints)</li>
            <li>Authenticated tenant dashboard flows hosted on Qtangl infrastructure</li>
          </ul>
        </Card>

        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Out of scope</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Social engineering, physical security, or third-party SaaS not operated by Qtangl</li>
            <li>Denial-of-service attacks against production services</li>
            <li>Issues in customer-controlled scan targets or tenant-uploaded content</li>
            <li>Reports without sufficient reproduction steps or impact assessment</li>
          </ul>
        </Card>

        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Contact</h2>
          <p className="mt-3">
            Email{" "}
            <a href={mailtoSecurityReport()} className="text-white underline underline-offset-4">
              {securityContactEmail}
            </a>{" "}
            with subject line <code className="text-white">{securityDisclosureSubject}</code>. Include reproduction
            steps, affected URLs or endpoints, impact assessment, and your preferred contact method.
          </p>
          <p className="mt-3 text-xs text-[var(--color-gray-500)]">
            Canonical machine-readable policy:{" "}
            <a
              href="https://www.qtangl.com/.well-known/security.txt"
              className="text-white underline"
              target="_blank"
              rel="noreferrer"
            >
              /.well-known/security.txt
            </a>
          </p>
        </Card>

        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Safe harbor</h2>
          <p className="mt-3">
            Qtangl supports good-faith security research that follows this policy. We will not pursue legal action
            under the Computer Fraud and Abuse Act or similar laws for research conducted in compliance with these
            guidelines, provided you do not exfiltrate customer data, degrade service availability, or access accounts
            that are not your own.
          </p>
        </Card>

        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Response SLAs</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Acknowledgement: within <strong className="text-white">{disclosureAckSlaBusinessDays} business days</strong>
            </li>
            <li>
              Critical remediation target: {disclosureRemediationSlas.critical}
            </li>
            <li>High remediation target: {disclosureRemediationSlas.high}</li>
            <li>Medium remediation target: {disclosureRemediationSlas.medium}</li>
          </ul>
        </Card>

        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Coordinated disclosure</h2>
          <p className="mt-3">
            We ask researchers to allow up to {coordinatedDisclosureDays} days after acknowledgement before public
            disclosure, unless we agree on a different timeline. Extensions are available by mutual agreement when
            remediation requires additional time.
          </p>
        </Card>

        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Recognition and bounty</h2>
          <p className="mt-3">
            With your permission, valid in-scope reports may be listed on{" "}
            <Link href="/trust/security" className="text-white underline underline-offset-4">
              /trust/security
            </Link>
            . Qtangl does not operate a paid bug bounty program at this time.
          </p>
        </Card>

        <p>
          <Link href="/trust" className="text-white underline underline-offset-4">
            ← Trust Center
          </Link>
        </p>
      </Section>
    </PageShell>
  );
}
