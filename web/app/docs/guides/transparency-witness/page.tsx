import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/transparency-witness",
  title: "Transparency witness onboarding",
  description: "Onboard an external witness that polls checkpoints, verifies consistency, and submits signatures.",
});

export default function TransparencyWitnessGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/transparency-witness"
      title="Transparency witness onboarding"
      description="Third parties can independently observe log growth and co-sign checkpoints for stronger trust."
    >
      <DocsSection>
        <DocsHeading>Witness role</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          A witness is an independent observer that validates append-only behavior and signs checkpoints. Witnesses
          reduce trust concentration by making log tampering detectable by multiple organizations.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Onboarding steps</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Poll latest checkpoint from <code className="font-mono text-white">GET /pqc/transparency/root</code>.
          </li>
          <li>
            Validate append-only growth using{" "}
            <code className="font-mono text-white">
              GET /pqc/transparency/consistency?from_size=A&amp;to_size=B
            </code>
            .
          </li>
          <li>
            Sign observed root and submit with{" "}
            <code className="font-mono text-white">POST /pqc/transparency/witness</code>.
          </li>
          <li>
            Confirm listing in <code className="font-mono text-white">GET /pqc/transparency/witnesses</code>.
          </li>
        </ol>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Automation reference</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          The repository includes a reference script at{" "}
          <code className="font-mono text-white">backend/scripts/qtangl_witness.py</code>. Run it under a scheduler
          with durable state so each iteration compares against the previous acknowledged checkpoint.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Operational safeguards</DocsHeading>
        <DocsCallout variant="warning">
          Keep witness signing keys in dedicated HSM-backed custody and monitor submission health. A stalled witness is
          operationally equivalent to reduced transparency coverage.
        </DocsCallout>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Pair this with the{" "}
          <Link href="/docs/guides/transparency" className="text-white underline underline-offset-4">
            transparency guide
          </Link>{" "}
          to define your checkpoint polling SLAs.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
