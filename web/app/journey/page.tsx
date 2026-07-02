import type { Metadata } from "next";
import Link from "next/link";

import MaturityModel from "@/components/marketing/MaturityModel";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { journeyPageCopy } from "@/lib/copy/readiness-journey";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/journey",
  title: journeyPageCopy.metadata.title,
  description: journeyPageCopy.metadata.description,
});

export default function JourneyPage() {
  const { hero, insight, personas, faqs } = journeyPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: "/assess", label: "Run Q-Day scan" },
          { href: "/assess", label: "Start with Assess", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <MaturityModel />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{insight.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{insight.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {insight.description}
          </p>
        </div>
      </Section>

      <Section gap="tight">
        <Eyebrow>Which one sounds like you?</Eyebrow>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.title} tone="feature" className="rounded-[var(--radius-xl)]">
              <p className="font-semibold text-white">{persona.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{persona.situation}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">{persona.nextStep}</p>
              <Link
                href={persona.href}
                className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4"
              >
                {persona.cta}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <Eyebrow>Common questions</Eyebrow>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question} tone="ghost" className="rounded-[var(--radius-xl)]">
              <p className="font-semibold text-white">{faq.question}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
