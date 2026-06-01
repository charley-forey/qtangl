import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/resources/readiness-index",
  title: "Q-Day Readiness Index | Qtangl",
  description: "Anonymized industry benchmarks for post-quantum readiness (preview).",
});

export default function ReadinessIndexPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Data"
        title="Q-Day Readiness Index"
        description="Peer benchmarks when opt-in volume meets k-anonymity thresholds. Preview uses illustrative segments."
      />

      <Section gap="tight">
        <Card tone="panel" className="p-6">
          <dl className="grid gap-4 sm:grid-cols-3 text-center">
            <div>
              <dt className="text-xs uppercase text-[var(--muted)]">Median</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">62.4</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--muted)]">P25</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">48.0</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--muted)]">P75</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">71.2</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs text-[var(--muted)]">
            Illustrative preview — not attestation. Full report gated for enterprise participants.
          </p>
        </Card>
        <Button href="/access">Request benchmark access</Button>
        <p className="mt-4 text-sm">
          <Link href="/resources/roi" className="text-white underline">
            ROI calculator
          </Link>
        </p>
      </Section>
    </PageShell>
  );
}
