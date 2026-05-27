import type { Metadata } from "next";

import DemoCatalogCard from "@/components/marketing/DemoCatalogCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  demoCatalog,
  demosPageCopy,
  sandboxCatalogEntry,
} from "@/lib/copy/demos";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo",
  title: "Demos",
  description:
    "Explore Qtangl demos: hospital re-staffing live today, API sandbox for developers, with construction and logistics workflows coming soon.",
});

export default function DemosPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={demosPageCopy.eyebrow}
        title={demosPageCopy.title}
        description={demosPageCopy.description}
      />

      <Section gap="tight" className="pb-0">
        <Eyebrow>{demosPageCopy.catalogHeading}</Eyebrow>
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {demoCatalog.map((demo) => (
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
