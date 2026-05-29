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
  path: "/docs/guides/pqc-demo",
  title: "PQC scanner demo guide",
  description: "Drive the Q-Day readiness scanner API and export CBOM migration reports.",
});

export default function PqcDemoGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/pqc-demo"
        title="PQC scanner demo guide"
        description="PQC migration pilot API workflow."
      />
      <DocsShell
        title="PQC scanner demo guide"
        description="Domain scan → Mosca HNDL risk → remediation backlog → PQ handshake proof → CBOM/PDF export."
        pathname="/docs/guides/pqc-demo"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="pilot" />
        <DocsSection>
          <DocsHeading>Interactive demo</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Open the{" "}
            <Link href="/demo/pqc" className="text-white underline underline-offset-4">
              Q-Day command center
            </Link>{" "}
            for the full UI.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Typical flow</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">GET /pqc/scenarios</code> — pick persona/scenario
            </li>
            <li>
              Optional: <code className="font-mono text-white">POST /pqc/upload-bundle</code> — PEM/CSV
            </li>
            <li>
              <code className="font-mono text-white">POST /pqc/scan</code> — fixture (sync) or live (poll)
            </li>
            <li>
              <code className="font-mono text-white">GET /pqc/report/{"{scanId}"}?format=cbom</code> — export
            </li>
          </ol>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Safety</DocsHeading>
          <p className="text-sm text-[var(--color-gray-300)]">
            Live scanning requires authorization, blocks private/metadata IPs, and respects{" "}
            <code className="font-mono text-white">QTANGL_PQC_ENABLE_LIVE_SCAN</code>.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
