import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import ReferencesPanel from "@/components/pqc/ReferencesPanel";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/trust",
  title: "Qtangl Trust Center",
  description: "Data handling, retention, report integrity, and security practices for Qtangl Q-Day readiness scans.",
});

export default function TrustPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Trust Center"
        title="Security, privacy, and report integrity"
        description="How Qtangl handles scan data, signs reports, and supports enterprise retention controls."
      />
      <Section>
        <div className="prose prose-invert max-w-3xl space-y-6 text-sm text-[var(--color-gray-300)]">
          <section>
            <h2 className="text-white">Data handling</h2>
            <p>
              Scan results are stored per tenant when Postgres persistence is enabled. You may delete scans via{" "}
              <code>DELETE /tenant/scans/&#123;id&#125;</code>. Tenant API keys are hashed at rest; revoke leaked keys
              immediately via admin.
            </p>
          </section>
          <section>
            <h2 className="text-white">Report integrity</h2>
            <p>
              Each migration report includes a SHA-256 content hash and signature (ML-DSA-65 when liboqs is available,
              Ed25519 fallback otherwise). Verify at{" "}
              <Link href="/verify" className="text-white underline">
                /verify
              </Link>
              .
            </p>
          </section>
          <section>
            <h2 className="text-white">Retention</h2>
            <p>
              Upload bundle sessions expire after 24 hours. Scan job retention follows your deployment configuration;
              contact Qtangl for enterprise data-residency options.
            </p>
          </section>
          <ReferencesPanel />
        </div>
      </Section>
    </PageShell>
  );
}
