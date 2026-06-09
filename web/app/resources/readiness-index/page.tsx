import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo";

import ReadinessIndexSnapshot from "./ReadinessIndexSnapshot";

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
        <ReadinessIndexSnapshot industry="financial" />
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
