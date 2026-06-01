import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import { pricingPageCopy } from "@/lib/copy/readiness-pricing";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/pricing",
  title: pricingPageCopy.metadata.title,
  description: pricingPageCopy.metadata.description,
});

export default function PricingPage() {
  const { hero, tiers, footnote, roiLink, optimizeLink } = pricingPageCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />

      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              tone={tier.featured ? "strong" : "feature"}
              size="lg"
              className={[
                "rounded-[var(--radius-feature)]",
                tier.featured ? "ring-1 ring-white/20" : "",
              ].join(" ")}
            >
              <Eyebrow>{tier.stage}</Eyebrow>
              <h2 className="heading-section mt-4">{tier.name}</h2>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{tier.price}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {tier.description}
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
                {tier.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="text-white" aria-hidden="true">
                      ·
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <LiveTodayFootnote features={tier.liveToday ?? []} />
              <div className="mt-8">
                <Button href={tier.cta.href}>{tier.cta.label}</Button>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-sm leading-7 text-[var(--color-gray-400)]">{footnote}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={roiLink.href}
            className="text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            {roiLink.label}
          </Link>
          <Link
            href={optimizeLink.href}
            className="text-sm font-medium text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
          >
            {optimizeLink.label}
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
