import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/crypto-flip-api",
  title: "Crypto flip API",
  description: "REST endpoints for dry-run, submit, approve, poll, and list crypto flip jobs.",
});

export default function CryptoFlipApiPage() {
  return (
    <GuidePageLayout pathname="/docs/reference/crypto-flip-api" title="Crypto flip API" description="Convert-tier flip control plane.">
      <DocsSection>
        <DocsHeading>Dry-run</DocsHeading>
        <p className="font-mono text-sm text-white">POST /tenant/remediation/program/{"{id}"}/flip/dry-run</p>
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">Body: flipSurface, provider, targetEnv, request</p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Submit</DocsHeading>
        <p className="font-mono text-sm text-white">POST /tenant/remediation/program/{"{id}"}/flip</p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Status</DocsHeading>
        <p className="font-mono text-sm text-white">GET /tenant/flips/{"{job_id}"}</p>
        <p className="mt-2 font-mono text-sm text-white">GET /tenant/flips?status=pending_approval</p>
        <p className="mt-2 font-mono text-sm text-white">GET /tenant/flips/{"{job_id}"}/poll</p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Governance</DocsHeading>
        <p className="font-mono text-sm text-white">POST /tenant/flips/{"{job_id}"}/approve</p>
        <p className="mt-2 font-mono text-sm text-white">POST /tenant/flips/{"{job_id}"}/cancel</p>
        <p className="mt-2 font-mono text-sm text-white">POST /tenant/flips/{"{job_id}"}/retry</p>
      </DocsSection>
      <DocsSection>
        <DocsHeading>Webhook</DocsHeading>
        <p className="text-sm text-[var(--color-gray-300)]">
          Event <code className="font-mono text-white">crypto.flip.completed</code> includes driftDelta with before/after snapshot IDs.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
