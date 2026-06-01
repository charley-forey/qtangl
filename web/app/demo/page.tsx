import type { Metadata } from "next";

import DemoCatalogCard from "@/components/marketing/DemoCatalogCard";
import ReadinessCrossLink from "@/components/marketing/ReadinessCrossLink";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  demoCatalog,
  demosPageCopy,
  optimizationDemoCatalog,
  sandboxCatalogEntry,
} from "@/lib/copy/demos";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo",
  title: "Demos",
  description:
    "Explore Qtangl demos: Q-Day readiness scanner, hospital re-staffing, airline recovery, and EV fleet routing.",
});

export default function DemosPage() {
  const pqcDemo = demoCatalog.find((demo) => demo.slug === "pqc");

  return (
    <PageShell>
      <PageHero
        eyebrow={demosPageCopy.eyebrow}
        title={demosPageCopy.title}
        description={demosPageCopy.description}
        actions={[
          { href: "/assess", label: "Run Q-Day scan" },
          { href: "/platform", label: "Platform overview", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <ReadinessCrossLink />
      </Section>

      {pqcDemo ? (
        <Section gap="tight" className="pb-0">
          <Eyebrow>{demosPageCopy.catalogHeading}</Eyebrow>
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <DemoCatalogCard demo={pqcDemo} />
          </div>
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        <Eyebrow>{demosPageCopy.labsHeading}</Eyebrow>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          Expansion motion — not part of the Q-Day readiness product.{" "}
          <a href="/labs" className="text-white underline-offset-4 hover:underline">
            View all Labs →
          </a>
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {optimizationDemoCatalog.map((demo) => (
            <DemoCatalogCard key={demo.slug} demo={demo} />
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <Eyebrow>{demosPageCopy.sandboxHeading}</Eyebrow>
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <DemoCatalogCard demo={sandboxCatalogEntry} />
        </div>
      </Section>
    </PageShell>
  );
}
