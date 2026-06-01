import type { Metadata } from "next";

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
  const { hero, insight, personas, touchpoints } = journeyPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: "/demo/pqc", label: "Run Q-Day scan" },
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
        <Eyebrow>Personas</Eyebrow>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.title} tone="feature" className="rounded-[var(--radius-xl)]">
              <p className="font-semibold text-white">{persona.title}</p>
              <p className="mt-2 text-sm text-[var(--color-gray-400)]">Trigger: {persona.trigger}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">Entry: {persona.entry}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <Eyebrow>Touchpoints by channel</Eyebrow>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              <tr>
                <th className="pb-3 pr-4">Channel</th>
                <th className="pb-3 pr-4">Assess</th>
                <th className="pb-3 pr-4">Monitor</th>
                <th className="pb-3">Convert</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              {touchpoints.map((row) => (
                <tr key={row.channel} className="border-t border-[var(--border-subtle)]">
                  <td className="py-3 pr-4 font-medium text-white">{row.channel}</td>
                  <td className="py-3 pr-4">{row.assess}</td>
                  <td className="py-3 pr-4">{row.monitor}</td>
                  <td className="py-3">{row.convert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </PageShell>
  );
}
