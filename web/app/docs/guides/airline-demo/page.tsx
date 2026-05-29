import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/airline-demo",
  title: "Airline demo guide",
  description: "Drive the OCC crew recovery pilot API and interpret scoreboard output.",
});

export default function AirlineDemoGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/airline-demo"
        title="Airline demo guide"
        description="Airline OCC recovery pilot API workflow."
      />
      <DocsShell
        title="Airline demo guide"
        description="Disruption → routing repair → crew assignment → hybrid audit → OCC scoreboard."
        pathname="/docs/guides/airline-demo"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="pilot" />
        <DocsSection>
          <DocsHeading>Interactive demo</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Open the{" "}
            <Link href="/demo/airline" className="text-white underline underline-offset-4">
              OCC command center
            </Link>{" "}
            for the full UI. This guide covers the underlying API.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Typical flow</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">GET /airline/scenarios</code> — pick a
              disruption
            </li>
            <li>
              Optional: <code className="font-mono text-white">POST /airline/upload-crew</code> —
              CSV session
            </li>
            <li>
              <code className="font-mono text-white">POST /airline/recover/solve</code> — routing +
              classical + hybrid
            </li>
          </ol>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
