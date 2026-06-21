import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/convert",
  title: "Convert workflow guide",
  description: "Move from findings to remediations with automation and verification checkpoints.",
});

export default function ConvertGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/convert"
      title="Convert workflow"
      description="Convert maps cryptographic risk into prioritized work, executes changes, and verifies outcomes."
    >
      <DocsSection>
        <DocsHeading>From backlog to action</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Convert starts after assessment. Pull recommendations for a specific scan, align owners and deadlines, and
          push bounded changes into engineering systems.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>1) Build a remediation plan</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Fetch actions:{" "}
            <code className="font-mono text-white">GET /tenant/scans/{"{scan_id}"}/remediation</code>
          </li>
          <li>
            Update status and owner:{" "}
            <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/remediation</code>
          </li>
          <li>
            Pull supporting rationale:{" "}
            <code className="font-mono text-white">GET /tenant/scans/{"{scan_id}"}/remediation/intelligence</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>2) Automate where safe</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Launch automation with{" "}
          <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/remediation/automate</code>. Use{" "}
          <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/integrations/push</code> to mirror
          accepted actions to ticketing or CLM systems.
        </p>
        <DocsCallout variant="warning">
          Keep key and certificate replacement flows under explicit approval gates. Automation should prepare and stage
          changes; production cutovers should still require owner sign-off.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>3) Simulate and de-risk changes</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Use <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/remediation/simulate</code> to
          compare rollback windows, blast radius, and policy impact before promoting runbooks.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>4) Re-verify and publish evidence</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Complete the cycle with{" "}
          <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/remediation/verify</code> and a new{" "}
          <code className="font-mono text-white">POST /pqc/scan</code> if inventory changed. Publish updated evidence
          through <code className="font-mono text-white">GET /tenant/scans/{"{scan_id}"}/report</code>.
        </p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Related guides</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/guides/crypto-flip" className="text-white underline underline-offset-4">
              Crypto flip workflow
            </Link>
          </li>
          <li>
            <Link href="/docs/guides/drift-monitoring" className="text-white underline underline-offset-4">
              Drift monitoring
            </Link>
          </li>
          <li>
            <Link href="/docs/guides/kms-flip-aws" className="text-white underline underline-offset-4">
              KMS flip (AWS)
            </Link>
          </li>
          <li>
            <Link href="/docs/guides/clm-flip-venafi" className="text-white underline underline-offset-4">
              CLM flip (Venafi)
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/crypto-flip-api" className="text-white underline underline-offset-4">
              Crypto flip API reference
            </Link>
          </li>
          <li>
            <Link href="/docs/reference/drift-api" className="text-white underline underline-offset-4">
              Drift API reference
            </Link>
          </li>
        </ul>
      </DocsSection>
    </GuidePageLayout>
  );
}
