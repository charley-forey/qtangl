import type { Metadata } from "next";
import Link from "next/link";

import DemoCatalogCard from "@/components/marketing/DemoCatalogCard";
import ReadinessCrossLink from "@/components/marketing/ReadinessCrossLink";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  labsHubCopy,
  optimizationDemoCatalog,
  sandboxCatalogEntry,
} from "@/lib/copy/demos";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/labs",
  title: labsHubCopy.metadata.title,
  description: labsHubCopy.metadata.description,
});

export default function LabsPage() {
  const { readinessBanner, demos, developer } = labsHubCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={labsHubCopy.hero.eyebrow}
        title={labsHubCopy.hero.title}
        description={labsHubCopy.hero.description}
        actions={[
          { href: "/platform", label: "Back to Q-Day platform" },
          { href: "/sandbox", label: "API sandbox", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <ReadinessCrossLink
          text={readinessBanner.text}
          href={readinessBanner.href}
          cta={readinessBanner.cta}
        />
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
          {optimizationDemoCatalog.map((demo) => (
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
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={developer.href}
            className="text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            {developer.cta}
          </Link>
          <Link
            href="/technology"
            className="text-sm font-medium text-[var(--color-gray-400)] underline-offset-4 hover:underline"
          >
            Technology deep dive →
          </Link>
        </div>
        <div className="mt-8">
          <DemoCatalogCard demo={sandboxCatalogEntry} />
        </div>
      </Section>
    </PageShell>
  );
}
