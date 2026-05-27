import type { Metadata } from "next";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { roadmapBands } from "@/lib/docs/roadmap";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/roadmap",
  title: "Roadmap",
  description: "Now, next, and later for Qtangl API capabilities.",
});

export default function RoadmapPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/resources/roadmap" title="Roadmap" description="Product roadmap." />
      <DocsShell
        title="Roadmap"
        description="Honest shipping bands — GA, pilot, research, and coming soon."
        pathname="/docs/resources/roadmap"
        searchIndex={docsSearchIndex}
      >
        {roadmapBands.map((band) => (
          <DocsSection key={band.id}>
            <DocsHeading id={band.id}>{band.label}</DocsHeading>
            <div className="grid gap-4 md:grid-cols-2">
              {band.items.map((item) => (
                <Card key={item.title} className="rounded-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <DocsBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </DocsSection>
        ))}
      </DocsShell>
    </div>
  );
}
