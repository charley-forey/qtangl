import type { Metadata } from "next";
import Link from "next/link";

import DemoCatalogCard from "@/components/marketing/DemoCatalogCard";
import Hero from "@/components/marketing/Hero";
import ReadinessCrossLink from "@/components/marketing/ReadinessCrossLink";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import { homeHero } from "@/lib/copy/home";
import {
  optimizationDemoCatalog,
} from "@/lib/copy/demos";
import { optimizeHubCopy } from "@/lib/copy/readiness-optimize";
import { optimizationMetadata } from "@/lib/copy/product";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/platform/optimize",
  title: optimizeHubCopy.metadata.title,
  description: optimizeHubCopy.metadata.description,
});

const optimizationDemos = optimizationDemoCatalog;

export default function OptimizeHubPage() {
  const { readinessBanner, demos, developer } = optimizeHubCopy;

  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <ReadinessCrossLink
          text={readinessBanner.text}
          href={readinessBanner.href}
          cta={readinessBanner.cta}
        />
      </Section>

      <Section gap="tight" className="pt-4 sm:pt-6">
        <Hero copy={homeHero} />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{demos.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{demos.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {demos.description}
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {optimizationDemos.map((demo) => (
            <DemoCatalogCard key={demo.slug} demo={demo} />
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="content-reading">
          <Eyebrow>{developer.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{developer.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {developer.description}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href={developer.href}
            className="text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            {developer.cta}
          </Link>
        </div>
        <p className="mt-10 text-sm text-[var(--color-gray-500)]">{optimizationMetadata.oneLiner}</p>
      </Section>
    </PageShell>
  );
}
