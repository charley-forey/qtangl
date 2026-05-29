import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/pqc/methodology",
  title: "Q-Day scanner methodology",
  description: "How Qtangl inventories quantum-vulnerable cryptography and scores Mosca HNDL exposure.",
});

export default function PqcMethodologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Methodology"
        title="Q-Day readiness methodology"
        description="NIST-aligned classification, Mosca inequality for harvest-now-decrypt-later, and hybrid ML-KEM proof — with honest coverage limits."
      />
      <Section>
        <div className="prose prose-invert max-w-3xl text-sm text-[var(--color-gray-300)]">
          <p>
            The scanner discovers TLS certificates, JWKS signing keys, SSH host keys, and related transport
            cryptography. Each asset is classified against Shor/Grover exposure estimates and mapped to FIPS
            203–205 replacements.
          </p>
          <p>
            Mosca&apos;s inequality (X + Y &gt; Z) drives the HNDL verdict: data shelf-life plus migration time
            versus years to cryptographically relevant quantum computing.
          </p>
          <p>
            <Link href="/demo/pqc" className="text-white underline">
              Return to the live demo
            </Link>
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
