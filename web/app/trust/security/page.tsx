import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust/security",
  title: "Security architecture | Qtangl Trust",
  description: "Data flows, encryption, tenant isolation, and report signing for Qtangl.",
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
        <p>
          <Link href="/trust" className="text-white underline">
            ← Trust Center
          </Link>
        </p>
      </Section>
    </PageShell>
  );
}
