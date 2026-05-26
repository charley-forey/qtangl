import type { Metadata } from "next";

import Image from "next/image";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { aboutContent, siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "About",
  description: "Mission, principles, and product direction behind Qtangl.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={aboutContent.eyebrow}
        title={aboutContent.title}
        description={aboutContent.intro}
      />
      <Section className="pt-0">
        <Card strong className="relative overflow-hidden rounded-[2rem]">
          <ProbabilityGrid />
          <div className="relative grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <div>
              <Eyebrow>Mission</Eyebrow>
              <p className="mt-4 text-2xl leading-tight text-white">
                Build optimization infrastructure that helps teams make better operational decisions under hard constraints.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)] bg-black/55">
                <Image
                  src="/qtangl-hero-probability-field.svg"
                  alt="Black and white abstract technical artwork with entangled nodes, interference lines, and probability fields."
                  fill
                  sizes="(min-width: 1280px) 28vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>
              <div className="grid gap-4">
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
          </div>
        </Card>
      </Section>

      <Section className="pt-0 pb-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-2xl">
            <Eyebrow>Identity</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              The brand is intentionally monochrome. Contrast, spacing, and restrained motion carry hierarchy instead of decorative color.
            </p>
          </Card>
          <Card className="rounded-2xl">
            <Eyebrow>Product direction</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Qtangl begins as a company site and developer platform, then expands into APIs, dashboards, and deeper optimization tooling.
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
    </PageShell>
  );
}
