import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { conceptsPage } from "@/lib/copy/docs";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/concepts",
  title: "Concepts",
  description: conceptsPage.description,
});

export default function ConceptsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/concepts"
        title={conceptsPage.title}
        description={conceptsPage.description}
      />
      <DocsShell
        title={conceptsPage.title}
        description={conceptsPage.description}
        pathname="/docs/concepts"
        searchIndex={docsSearchIndex}
        lastUpdated={conceptsPage.lastUpdated}
      >
        <p className="text-xs text-[var(--color-gray-500)]">
          Last updated: {conceptsPage.lastUpdated}
        </p>

        <DocsSection>
          <DocsHeading>{conceptsPage.journey.title}</DocsHeading>
          <DocsCallout variant="info">{conceptsPage.journey.description}</DocsCallout>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {conceptsPage.tiers.map((tier) => (
              <Card key={tier.label} className="rounded-2xl">
                <p className="text-label">{tier.label}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {tier.summary}
                </p>
              </Card>
            ))}
          </div>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <Link href="/docs/guides/assess" className="text-white underline underline-offset-4">
                Assess workflow guide
              </Link>
            </li>
            <li>
              <Link
                href="/docs/guides/monitor-workflow"
                className="text-white underline underline-offset-4"
              >
                Monitor workflow guide
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/convert" className="text-white underline underline-offset-4">
                Convert workflow guide
              </Link>
            </li>
          </ul>
        </DocsSection>

        {conceptsPage.sections.map((section) => (
          <DocsSection key={section.title}>
            <DocsHeading>{section.title}</DocsHeading>
            <Card className="rounded-2xl">
              <p className="text-label">{section.eyebrow}</p>
              <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
                {section.description}
              </p>
            </Card>
          </DocsSection>
        ))}

        <DocsSection>
          <DocsHeading>Evidence pipeline</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              Scan with <code className="font-mono text-white">POST /pqc/scan</code> — live TLS
              inventory or fixture mode for demos.
            </li>
            <li>
              Export CBOM or PDF via{" "}
              <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}</code>.
            </li>
            <li>
              Verify signatures at{" "}
              <Link href="/verify" className="text-white underline underline-offset-4">
                /verify
              </Link>{" "}
              or with the{" "}
              <Link href="/docs/sdks" className="text-white underline underline-offset-4">
                qtangl-verify CLI
              </Link>
              .
            </li>
            <li>
              Optional transparency log inclusion — see the{" "}
              <Link
                href="/docs/guides/transparency"
                className="text-white underline underline-offset-4"
              >
                transparency guide
              </Link>
              .
            </li>
          </ol>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Method honesty</DocsHeading>
          <DocsCallout variant="honesty">{conceptsPage.methodHonesty}</DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>{conceptsPage.glossaryTitle}</DocsHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {conceptsPage.glossary.map((term) => (
              <div
                key={term.label}
                className="rounded-xl border border-[var(--border)] bg-black/40 p-4"
              >
                <p className="text-label">{term.label}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {term.meaning}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm">
            <Link
              href="/docs/resources/glossary"
              className="text-white underline underline-offset-4"
            >
              Full glossary →
            </Link>
          </p>
        </DocsSection>

        <Card strong className="rounded-2xl">
          <p className="text-label">Go deeper</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <Link href="/q-day/hndl" className="text-white underline underline-offset-4">
                HNDL education hub
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/cbom" className="text-white underline underline-offset-4">
                CBOM export guide
              </Link>
            </li>
            <li>
              <Link href="/docs/verify-spec" className="text-white underline underline-offset-4">
                Verify specification
              </Link>
            </li>
            <li>
              <Link href="/docs/guides/pqc-demo" className="text-white underline underline-offset-4">
                PQC demo walkthrough
              </Link>
            </li>
          </ul>
        </Card>
      </DocsShell>
    </div>
  );
}
