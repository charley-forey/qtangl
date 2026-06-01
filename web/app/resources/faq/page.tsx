import type { Metadata } from "next";

import ReadinessFaq from "@/components/marketing/ReadinessFaq";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { faqPageCopy } from "@/lib/copy/readiness-resources";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/resources/faq",
  title: faqPageCopy.metadata.title,
  description: faqPageCopy.metadata.description,
});

export default function FaqPage() {
  const { hero } = faqPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: "/trust", label: "Trust center" },
          { href: "/demo/pqc", label: "Run Q-Day scan", variant: "secondary" },
        ]}
      />
      <Section gap="tight">
        <ReadinessFaq />
      </Section>
      <Section gap="tight" className="pb-0">
        <div className="flex flex-wrap gap-3">
          <Button href="/resources/roi">ROI calculator</Button>
          <Button href="/access" variant="secondary">
            Request pilot
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
