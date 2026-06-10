import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/crypto-flip",
  title: "Crypto flip orchestration",
  description: "Orchestrate overlay, CLM, and KMS flips with dry-run, approval, and signed before/after proof.",
});

export default function CryptoFlipGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/crypto-flip"
      title="Crypto flip"
      description="Qtangl orchestrates cryptographic changes in customer-owned CLM, KMS, and infra — with governance and evidence."
    >
      <DocsSection>
        <DocsHeading>Overview</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Crypto flip drives PQC/hybrid changes through your systems (not a native overlay appliance). Every flip captures
          before/after drift snapshots and verify re-scan proof. See ADR-010 for scope boundaries.
        </p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Workflow</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Open a remediation program item and choose surface (overlay, CLM, KMS) and provider.</li>
          <li>Run dry-run — preview diff with no side effects.</li>
          <li>Submit flip; prod targets require approval (Enterprise KMS prod: two-person rule).</li>
          <li>Poll job status; external ref links to PR, CLM request, or KMS alias change.</li>
          <li>Verify re-scan attaches signed proof; webhook <code className="font-mono text-white">crypto.flip.completed</code> fires.</li>
        </ol>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Provider runbooks</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <a className="underline" href="/docs/guides/clm-flip-venafi">
              Venafi CLM flip
            </a>
          </li>
          <li>
            <a className="underline" href="/docs/guides/kms-flip-aws">
              AWS KMS flip
            </a>
          </li>
        </ul>
      </DocsSection>
    </GuidePageLayout>
  );
}
