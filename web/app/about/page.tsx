import type { Metadata } from "next";

import Section from "@/components/layout/Section";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { aboutContent, siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "About",
  description: "Mission, principles, and product philosophy behind Qtangl.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="max-w-4xl">
          <Eyebrow>{aboutContent.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {aboutContent.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
            {aboutContent.intro}
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <Card strong className="relative overflow-hidden rounded-[2rem]">
          <ProbabilityGrid />
          <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>Mission</Eyebrow>
              <p className="mt-4 text-2xl leading-tight text-white">
                Build optimization infrastructure at the boundary of classical and quantum computation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {aboutContent.principles.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-xl border border-[var(--border)] bg-black/55 p-4"
                >
                  <h2 className="text-lg font-semibold text-white">{principle.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      <Section className="pt-0 pb-20 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl">
            <Eyebrow>Identity</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              The brand is intentionally monochrome. Contrast, spacing, and motion carry hierarchy instead of color accents.
            </p>
          </Card>
          <Card className="rounded-2xl">
            <Eyebrow>Product direction</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Qtangl begins as a company site and developer interface, then expands into APIs, dashboards, and research-grade tooling.
            </p>
          </Card>
          <Card className="rounded-2xl">
            <Eyebrow>Signal</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              {siteMetadata.oneLiner}
            </p>
          </Card>
        </div>
      </Section>
    </main>
  );
}
