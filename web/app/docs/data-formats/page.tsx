import type { Metadata } from "next";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { dataFormatGuides } from "@/lib/demo-data";
import { docsGuideCopy } from "@/lib/copy/docs";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/data-formats",
  title: "Data Formats",
  description:
    "Prepare schedule, routing, and staffing data for Qtangl's quantum-aware planning workflow.",
});

const statusByType = {
  schedule: "ga" as const,
  routing: "pilot" as const,
  allocation: "pilot" as const,
};

export default function DataFormatsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/data-formats"
        title={docsGuideCopy.dataFormats.title}
        description={docsGuideCopy.dataFormats.description}
      />
      <DocsShell
        title={docsGuideCopy.dataFormats.title}
        description={docsGuideCopy.dataFormats.description}
        pathname="/docs/data-formats"
        searchIndex={docsSearchIndex}
      >
        <DocsCallout variant="honesty">
          Schedule payloads are live on POST /optimize. Routing and allocation shapes are
          documented for integration planning; the solver returns 501 until those pipelines ship.
        </DocsCallout>

        {dataFormatGuides.map((guide) => {
          const fields: DocsFieldRow[] = guide.fields.map((field) => ({
            name: field.name,
            type: "string | number",
            description: field.meaning,
            example: field.example,
          }));
          const status = statusByType[guide.problemType];

          return (
            <DocsSection key={guide.problemType}>
              <div className="flex flex-wrap items-center gap-3">
                <DocsHeading>{guide.title}</DocsHeading>
                <DocsBadge status={status} />
              </div>
              <p className="text-sm leading-8 text-[var(--color-gray-300)]">{guide.intro}</p>
              <DocsFieldTable fields={fields} />
              <Card className="rounded-2xl">
                <p className="text-label">{docsGuideCopy.dataFormats.csvTitle}</p>
                <p className="mt-4 font-mono text-sm leading-7 text-[var(--color-gray-300)]">
                  {guide.csvColumns.join(", ")}
                </p>
              </Card>
            </DocsSection>
          );
        })}

        <DocsSection>
          <DocsHeading>Constraints DSL</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Today, constraints are plain-text rules your team already uses: precedence (
            <code className="font-mono text-white">A must finish before B</code>), blocked windows (
            <code className="font-mono text-white">Crew B unavailable on day 2</code>), and
            ordering hints for routing. Structured constraint objects are on the roadmap.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
