import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/hospital-demo",
  title: "Hospital demo guide",
  description: "Drive the hospital re-staffing pilot API and interpret scoreboard output.",
});

export default function HospitalDemoGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/hospital-demo"
        title="Hospital demo guide"
        description="Hospital pilot API workflow."
      />
      <DocsShell
        title="Hospital demo guide"
        description="Nurse call-out → classical solve → hybrid audit → ops-ready scoreboard."
        pathname="/docs/guides/hospital-demo"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="pilot" />

        <DocsSection>
          <DocsHeading>Interactive demo</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Open the{" "}
            <Link href="/demo/hospital" className="text-white underline underline-offset-4">
              hospital command center
            </Link>{" "}
            for the full UI. This guide covers the underlying API.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Typical flow</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">GET /hospital/scenarios</code> — pick a
              call-out scenario
            </li>
            <li>
              Optional: <code className="font-mono text-white">POST /hospital/upload-roster</code>{" "}
              — CSV session
            </li>
            <li>
              <code className="font-mono text-white">POST /hospital/callout/solve</code> — run
              classical + hybrid audit
            </li>
            <li>Inspect scoreboard, auditPacks, and timeline in the response</li>
          </ol>
        </DocsSection>

        <DocsCallout variant="honesty">
          Production Railway deployments use live classical solve + cached QPU trace replay. IBM
          Quantum credentials are optional and used for offline trace refresh only.
        </DocsCallout>

        <DocsSection>
          <DocsHeading>Endpoint reference</DocsHeading>
          <ul className="space-y-2 text-sm">
            {[
              ["roster", "GET /hospital/roster"],
              ["scenarios", "GET /hospital/scenarios"],
              ["callout", "GET /hospital/callout"],
              ["qpu-trace", "GET /hospital/qpu-trace"],
              ["upload-roster", "POST /hospital/upload-roster"],
              ["callout-solve", "POST /hospital/callout/solve"],
            ].map(([slug, label]) => (
              <li key={slug}>
                <Link
                  href={`/docs/reference/hospital/${slug}`}
                  className="text-white underline underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
