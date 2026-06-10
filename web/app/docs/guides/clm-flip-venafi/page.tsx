import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/clm-flip-venafi",
  title: "Venafi CLM flip runbook",
  description: "Configure Venafi integration and execute orchestrated certificate flips from Qtangl.",
});

export default function VenafiFlipRunbookPage() {
  return (
    <GuidePageLayout pathname="/docs/guides/clm-flip-venafi" title="Venafi CLM flip" description="Certificate request and install orchestration via Venafi TPP / Firefly.">
      <DocsSection>
        <DocsHeading>Prerequisites</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-gray-300)]">
          <li>Tenant integration <code className="font-mono text-white">clm-venafi</code> with API credentials</li>
          <li><code className="font-mono text-white">writeBackEnabled: true</code> for install step</li>
          <li>PQC-capable certificate policy template in Venafi</li>
          <li><code className="font-mono text-white">CRYPTO_FLIP_ENABLED</code> and <code className="font-mono text-white">cryptoFlip.clm</code> tenant flags</li>
        </ul>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Flip steps</DocsHeading>
        <p className="text-sm text-[var(--color-gray-300)]">
          POST dry-run then submit with <code className="font-mono text-white">provider: venafi</code>,{" "}
          <code className="font-mono text-white">flipSurface: clm</code>. Poll until request status is issued; trigger verify scan on target FQDN.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
