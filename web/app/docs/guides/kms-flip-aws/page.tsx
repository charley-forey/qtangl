import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/kms-flip-aws",
  title: "AWS KMS flip runbook",
  description: "Least-privilege IAM, alias migration, and Enterprise governance for KMS flips.",
});

export default function AwsKmsFlipRunbookPage() {
  return (
    <GuidePageLayout pathname="/docs/guides/kms-flip-aws" title="AWS KMS flip" description="Controlled alias and key lifecycle orchestration — no private key export.">
      <DocsSection>
        <DocsHeading>IAM roles</DocsHeading>
        <p className="text-sm text-[var(--color-gray-300)]">
          Use separate roles: read-only (<code className="font-mono text-white">aws-readonly-policy.json</code>) and flip (
          <code className="font-mono text-white">aws-kms-flip-policy.json</code>). Flip role denies Decrypt and GetPublicKey export.
        </p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Prod governance</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-gray-300)]">
          <li>Enterprise tier required for prod KMS flip</li>
          <li>Two-person approval: approver ≠ submitter</li>
          <li>24h cooldown between prod KMS flips per tenant</li>
          <li>Rollback: revert alias to <code className="font-mono text-white">previousKeyId</code> in job result</li>
        </ul>
      </DocsSection>
    </GuidePageLayout>
  );
}
