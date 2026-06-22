import type { Metadata } from "next";
import Link from "next/link";

import FeatureCard from "@/components/marketing/FeatureCard";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import PlatformSampleEmbed from "@/components/marketing/PlatformSampleEmbed";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { platformPageCopy } from "@/lib/copy/readiness-platform";
import { whyQtanglDifferentiators } from "@/lib/copy/readiness-value";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/platform",
  title: platformPageCopy.metadata.title,
  description: platformPageCopy.metadata.description,
});

export default function PlatformPage() {
  const { hero, journey, tiers, proof, maturity, whyQtangl } = platformPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
      />

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{journey.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{journey.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {journey.description}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <FeatureCard
              key={tier.title}
              eyebrow={tier.eyebrow}
              title={tier.title}
              href={tier.href}
              ctaLabel={tier.cta}
              imageSrc={tier.image}
              imageAlt={tier.imageAlt}
            >
              <p>{tier.description}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <ValueProofStrip />
        <LiveTodayFootnote
          features={[
            "Assess · Monitor · Convert journey",
            "Sample CBOM + signed verify",
            "Dashboard with schedules, DLQ, remediation",
          ]}
        />
        <PlatformSampleEmbed />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{whyQtangl.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{whyQtangl.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {whyQtangl.description}
          </p>
          {"compareHref" in whyQtangl && whyQtangl.compareHref ? (
            <p className="mt-4">
              <a
                href={whyQtangl.compareHref}
                className="text-sm text-white underline underline-offset-4"
              >
                {whyQtangl.compareLabel}
              </a>
            </p>
          ) : null}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {whyQtanglDifferentiators.map((item) => (
            <FeatureCard key={item.title} title={item.title}>
              <p>{item.description}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{proof.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{proof.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {proof.description}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {proof.actions.map((action) => (
            <Button
              key={action.href}
              href={action.href}
              variant={"variant" in action && action.variant === "secondary" ? "secondary" : "primary"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="content-reading">
          <Eyebrow>{maturity.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{maturity.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {maturity.description}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href={maturity.href}
            className="text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            {maturity.cta}
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
