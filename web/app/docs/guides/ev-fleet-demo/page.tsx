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
  path: "/docs/guides/ev-fleet-demo",
  title: "EV fleet demo guide",
  description: "Drive the depot charging + routing pilot API and interpret the scoreboard.",
});

export default function EvFleetDemoGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/ev-fleet-demo"
        title="EV fleet demo guide"
        description="EV fleet depot charging pilot API workflow."
      />
      <DocsShell
        title="EV fleet demo guide"
        description="Upload → VRP → CP-SAT charger queue → hybrid stagger → scoreboard."
        pathname="/docs/guides/ev-fleet-demo"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Interactive demo</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Open the{" "}
            <Link href="/demo/ev-fleet" className="text-white underline underline-offset-4">
              depot command center
            </Link>{" "}
            to run scenarios with fixture QPU replay (default) or live QAOA when enabled on the
            backend.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Workflow</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-8 text-[var(--color-gray-300)]">
            <li>GET /ev-fleet/depot — load fleet, stops, chargers, tariff.</li>
            <li>POST /ev-fleet/upload-fleet and /upload-stops (optional CSV sessions).</li>
            <li>POST /ev-fleet/plan/solve — full pipeline with scoreboard and audit packs.</li>
          </ol>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
