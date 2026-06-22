import Link from "next/link";

import LearnNewsletterSignup from "@/components/learn/LearnNewsletterSignup";
import ReadinessMarkdown from "@/components/marketing/ReadinessMarkdown";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  loadQuantumCryptoGuideMarkdown,
  quantumCryptoGuideCopy,
} from "@/lib/quantum-crypto-guide";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/learn/quantum-crypto/guide",
  title: quantumCryptoGuideCopy.title,
  description: quantumCryptoGuideCopy.intro,
  type: "article",
});

export default async function QuantumCryptoGuidePage() {
  const bodyMarkdown = await loadQuantumCryptoGuideMarkdown();

  return (
    <PageShell>
      <PageHero
        eyebrow={quantumCryptoGuideCopy.eyebrow}
        title={quantumCryptoGuideCopy.title}
        description={quantumCryptoGuideCopy.intro}
        actions={[
          { href: "/learn/quantum-crypto", label: "Curriculum hub" },
          {
            href: quantumCryptoGuideCopy.downloadHref,
            label: "Download .md",
            variant: "secondary" as const,
          },
          {
            href: "/blog/learning-quantum-crypto-4-week-path",
            label: "4-week path article",
            variant: "secondary" as const,
          },
        ]}
        contentClassName="max-w-4xl"
      />

      <Section gap="tight">
        <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <ReadinessMarkdown markdown={bodyMarkdown} />
          </Card>
        </div>
      </Section>

      <Section gap="tight">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Email the curriculum</Eyebrow>
          <h2 className="heading-section mt-4 !text-2xl">Get the 4-week curriculum by email.</h2>
          <div className="mt-6">
            <LearnNewsletterSignup variant="quantum-crypto" />
          </div>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0">
        <p className="text-sm text-[var(--color-gray-400)]">
          Prefer the interactive hub?{" "}
          <Link href="/learn/quantum-crypto" className="text-white underline underline-offset-4">
            Open the full curriculum
          </Link>{" "}
          with video thumbnails, layer checkpoints, and diagrams.
        </p>
      </Section>
    </PageShell>
  );
}
