import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import {
  pqcDataFormatGuides,
  pqcDataFormatsMeta,
} from "@/lib/copy/pqc-data-formats";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/data-formats",
  title: "Data Formats",
  description: pqcDataFormatsMeta.description,
});

export default function DataFormatsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/data-formats"
        title={pqcDataFormatsMeta.title}
        description={pqcDataFormatsMeta.description}
      />
      <DocsShell
        title={pqcDataFormatsMeta.title}
        description={pqcDataFormatsMeta.description}
        pathname="/docs/data-formats"
        searchIndex={docsSearchIndex}
        lastUpdated={pqcDataFormatsMeta.lastUpdated}
      >
        <p className="text-xs text-[var(--color-gray-500)]">
          Last updated: {pqcDataFormatsMeta.lastUpdated}
        </p>

        <DocsCallout variant="info">
          Canonical JSON Schema definitions live on{" "}
          <Link href="/docs/reference/schemas" className="text-white underline underline-offset-4">
            JSON schemas
          </Link>
          . Sample CBOM:{" "}
          <Link
            href="/samples/sample-cbom-bank-tls-inventory.json"
            className="text-white underline underline-offset-4"
          >
            sample-cbom-bank-tls-inventory.json
          </Link>
          .
        </DocsCallout>

        {pqcDataFormatGuides.map((guide) => {
          const fields: DocsFieldRow[] = guide.fields.map((field) => ({
            name: field.name,
            type: field.type,
            description: field.meaning,
            example: field.example,
          }));

          return (
            <DocsSection key={guide.id}>
              <div className="flex flex-wrap items-center gap-3">
                <DocsHeading>{guide.title}</DocsHeading>
                <DocsBadge status={guide.status} />
              </div>
              <p className="text-sm leading-8 text-[var(--color-gray-300)]">{guide.intro}</p>
              <DocsFieldTable fields={fields} />
              {guide.exampleJson ? (
                <Card className="rounded-2xl">
                  <p className="text-label">{guide.exampleLabel ?? "Example"}</p>
                  {guide.exampleJson.startsWith("Download:") ? (
                    <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                      <Link
                        href="/samples/sample-cbom-bank-tls-inventory.json"
                        className="font-mono text-white underline underline-offset-4"
                      >
                        /samples/sample-cbom-bank-tls-inventory.json
                      </Link>
                    </p>
                  ) : (
                    <pre className="mt-4 overflow-x-auto font-mono text-sm leading-7 text-[var(--color-gray-300)]">
                      {guide.exampleJson}
                    </pre>
                  )}
                </Card>
              ) : null}
              {guide.notes?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
                  {guide.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
            </DocsSection>
          );
        })}

        <DocsSection>
          <DocsHeading>Report format query parameter</DocsHeading>
          <DocsFieldTable
            fields={[
              {
                name: "format=json",
                type: "query",
                description: "Full machine-readable report for integrations.",
              },
              {
                name: "format=cbom",
                type: "query",
                description: "CycloneDX CBOM export with qtangl: provenance properties.",
              },
              {
                name: "format=pdf",
                type: "query",
                description: "Human-readable signed audit packet.",
              },
              {
                name: "format=bundle",
                type: "query",
                description: "ZIP evidence bundle (report, CBOM, verify metadata).",
              },
              {
                name: "format=csv",
                type: "query",
                description: "Flat asset table for spreadsheet workflows.",
              },
            ]}
          />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Method honesty</DocsHeading>
          <DocsCallout variant="honesty">{pqcDataFormatsMeta.methodHonesty}</DocsCallout>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
