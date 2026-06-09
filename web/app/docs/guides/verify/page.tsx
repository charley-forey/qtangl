import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/verify",
  title: "Verify guide",
  description: "Understand report verification flows across /verify and the formal verify specification.",
});

export default function VerifyGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/verify"
      title="Verify guide"
      description="Verify provides cryptographic proof checks for report artifacts and transparency inclusion."
    >
      <DocsSection>
        <DocsHeading>Verification model</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          A report is only trustworthy when content hash, signatures, and transparency state align. Qtangl exposes this
          through the public verifier UI and API endpoints.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Online verification endpoints</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Verify by id: <code className="font-mono text-white">GET /pqc/verify/{"{scan_id}"}</code>
          </li>
          <li>
            Verify uploaded proof: <code className="font-mono text-white">POST /pqc/verify</code>
          </li>
          <li>
            Fetch active trust anchors: <code className="font-mono text-white">GET /pqc/transparency/keys</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>User-facing verifier</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          The <Link href="/verify" className="text-white underline underline-offset-4">/verify</Link> page is designed
          for auditors, customers, and procurement teams. It validates proof bundles without requiring tenant context.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Specification alignment</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Implementation details and expected claim structure are defined in{" "}
          <Link href="/docs/verify-spec" className="text-white underline underline-offset-4">
            verify-spec
          </Link>
          . Use the same ruleset in CI gates and partner attestations to keep checks deterministic across environments.
        </p>
        <DocsCallout variant="tip">
          Treat verification as a release control: block downstream promotion when{" "}
          <code className="font-mono text-white">verified !== true</code> or when expected signer lineage does not
          match policy.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
