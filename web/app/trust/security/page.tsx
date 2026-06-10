import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import {
  disclosureAckSlaBusinessDays,
  mailtoSecurityReport,
  primaryContactEmail,
  securityContactEmail,
} from "@/lib/copy/trust";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust/security",
  title: "Security architecture | Qtangl Trust",
  description: "Data flows, encryption, tenant isolation, report signing, and vulnerability disclosure for Qtangl.",
});

export default function TrustSecurityPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Trust Center"
        title="Security architecture"
        description="How Qtangl processes scan data, protects credentials, and signs reports."
      />

      <Section gap="tight" className="prose-invert max-w-3xl space-y-6 text-sm leading-7 text-[var(--muted)]">
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Data flow</h2>
          <p className="mt-3">
            API requests authenticate with tenant API keys (hashed at rest). Scan jobs queue in Redis;
            workers execute discovery, persist bundles in Postgres per tenant, and run post-complete
            diff/alert/webhook pipelines.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/trust/data-flow.svg"
            alt="Qtangl data flow diagram"
            className="mt-4 max-w-full rounded-lg border border-[var(--border-subtle)]"
          />
        </Card>
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Encryption</h2>
          <p className="mt-3">
            TLS in transit for all public endpoints. Integration secrets (Jira tokens) encrypt at rest when{" "}
            <code className="text-white">QTANGL_SECRETS_KEY</code> is configured. Webhooks support optional
            HMAC signing.
          </p>
        </Card>
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Report integrity</h2>
          <p className="mt-3">
            Reports include content hashes and signatures (ML-DSA-65 or Ed25519). Verify at{" "}
            <Link href="/verify" className="text-white underline">
              /verify
            </Link>
            .
          </p>
        </Card>
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Vulnerability disclosure</h2>
          <p className="mt-3">
            Report security issues responsibly to{" "}
            <a href={mailtoSecurityReport()} className="text-white underline">
              {securityContactEmail}
            </a>{" "}
            (subject <code className="text-white">[SECURITY]</code>) or see our{" "}
            <Link href="/trust/disclosure" className="text-white underline">
              disclosure policy
            </Link>
            . Include reproduction steps, impact assessment, and your preferred contact method. We aim to
            acknowledge reports within {disclosureAckSlaBusinessDays} business days.
          </p>
          <p className="mt-3 text-xs text-[var(--color-gray-500)]">
            Canonical policy:{" "}
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
          <h2 className="text-lg font-medium text-white">Penetration testing</h2>
          <p className="mt-3">
            Independent penetration testing is scoped in our internal pen-test scope document. Executive summary
            available under NDA on document request. Last pen test: not yet executed — scheduled before first
            regulated pilot.
          </p>
        </Card>
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Security overview</h2>
          <p className="mt-3">
            Download the{" "}
            <Link href="/downloads/qtangl-security-overview.md" className="text-white underline">
              security overview
            </Link>{" "}
            for architecture, encryption, sub-processors, and honest SOC 2 status.
          </p>
        </Card>
        <Card tone="panel" className="p-6">
          <h2 className="text-lg font-medium text-white">Acknowledgments</h2>
          <p className="mt-3">
            We maintain this page as the acknowledgments destination referenced in our{" "}
            <code className="text-white">security.txt</code> file. Security researchers who report valid
            vulnerabilities in scope will be listed here with permission after remediation.
          </p>
          <p className="mt-3 text-[var(--color-gray-400)]">
            No public acknowledgments yet — we are early in our disclosure program. Thank you to everyone who
            reports issues responsibly.
          </p>
          <dl className="mt-4 grid gap-2 text-xs text-[var(--color-gray-500)]">
            <div>
              <dt className="uppercase tracking-[0.14em]">Contact</dt>
              <dd className="mt-1 text-[var(--color-gray-300)]">{primaryContactEmail}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em]">Policy</dt>
              <dd className="mt-1">
                <Link href="/trust/disclosure" className="text-white underline">
                  Disclosure policy
                </Link>
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em]">Expires</dt>
              <dd className="mt-1 text-[var(--color-gray-300)]">2027-06-01</dd>
            </div>
          </dl>
        </Card>
        <p>
          <Link href="/trust" className="text-white underline">
            ← Trust Center
          </Link>
        </p>
      </Section>
    </PageShell>
  );
}
