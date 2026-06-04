import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { SolutionPageCopy } from "@/lib/copy/readiness-solutions";

type SolutionLandingPageProps = {
  copy: SolutionPageCopy;
};

export default function SolutionLandingPage({ copy }: SolutionLandingPageProps) {
  const { hero, why, frameworks, value, demo, cta } = copy;

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: hero.scenarioHref, label: hero.scenarioLabel },
          { href: "/assess", label: "Explore Assess", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{why.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{why.title}</h2>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {why.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{frameworks.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{frameworks.title}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {frameworks.items.map((item) => (
            <Card key={item.name} tone="feature" className="rounded-[var(--radius-xl)]">
              <p className="font-semibold text-white">{item.name}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{item.relevance}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{value.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{value.title}</h2>
        </div>
        <div className="mt-8 overflow-hidden rounded-[var(--radius-feature)] border border-[var(--border)]">
          <div className="grid divide-y divide-[var(--border)]">
            {value.rows.map((row) => (
              <div key={row.pain} className="grid gap-2 px-6 py-5 sm:grid-cols-2 sm:gap-6">
                <p className="text-sm text-[var(--color-gray-400)]">{row.pain}</p>
                <p className="text-sm leading-7 text-white">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{demo.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{demo.title}</h2>
        </div>
        <ol className="mt-6 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
          {demo.steps.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </Section>

      {copy.hndlResources?.length ? (
        <Section gap="tight">
          <Eyebrow>HNDL education</Eyebrow>
          <div className="mt-6 flex flex-wrap gap-3">
            {copy.hndlResources.map((link) => (
              <Button key={link.href} href={link.href} variant="secondary" size="sm">
                {link.label}
              </Button>
            ))}
          </div>
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <h2 className="heading-section">{cta.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
            {cta.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={cta.primary.href}>{cta.primary.label}</Button>
            <Button href={cta.secondary.href} variant="secondary">
              {cta.secondary.label}
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}

export function SolutionsIndex({ items }: { items: readonly { title: string; description: string; href: string }[] }) {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <FeatureCard
          key={item.href}
          title={item.title}
          description={item.description}
          href={item.href}
          ctaLabel="Open playbook →"
        />
      ))}
    </div>
  );
}
