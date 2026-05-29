import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/pqc",
  title: "Qtangl on both sides of Q-Day",
  description:
    "Hybrid optimization today. Post-quantum migration readiness tomorrow.",
});

export default function PqcProductPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Post-quantum security"
        title="Both sides of Q-Day"
        description="Extract value from hybrid optimization now — and prove your stack survives the post-quantum transition."
      />
      <Section>
        <div className="flex flex-wrap gap-3">
          <Button href="/demo/pqc">Open Q-Day scanner</Button>
          <Button href="/demo/hospital" variant="secondary">
            Hospital optimizer demo
          </Button>
          <Button href="/docs/guides/pqc-demo" variant="secondary">
            API guide
          </Button>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-[var(--color-gray-400)]">
          The scanner exports CycloneDX CBOM, CSV remediation backlogs, and executive PDF summaries aligned
          to NSM-10, CNSA 2.0, and NIST IR 8547 timelines.
        </p>
      </Section>
    </PageShell>
  );
}
