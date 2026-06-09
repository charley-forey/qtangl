import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/transparency",
  title: "Transparency log guide",
  description: "Use log roots, inclusion proofs, and consistency checks to validate append-only attestations.",
});

export default function TransparencyGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/transparency"
      title="Transparency log guide"
      description="Transparency makes report publication tamper-evident through append-only Merkle checkpoints."
    >
      <DocsSection>
        <DocsHeading>Core concepts</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Each published report contributes a content hash leaf.</li>
          <li>The service signs and exposes a latest root checkpoint.</li>
          <li>Anyone can verify inclusion and append-only growth without tenant credentials.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Public transparency endpoints</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Current root: <code className="font-mono text-white">GET /pqc/transparency/root</code>
          </li>
          <li>
            Key history: <code className="font-mono text-white">GET /pqc/transparency/keys</code>
          </li>
          <li>
            Inclusion proof:{" "}
            <code className="font-mono text-white">GET /pqc/transparency/{"{content_hash}"}</code>
          </li>
          <li>
            Consistency proof:{" "}
            <code className="font-mono text-white">
              GET /pqc/transparency/consistency?from_size=A&amp;to_size=B
            </code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Operational use</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Embed root snapshots into release records. During incident response, compare historic checkpoints to current
          roots and validate no fork or silent rewrite occurred.
        </p>
        <DocsCallout variant="info">
          Key lifecycle events are published in-band. Admin operators can retire old keys using{" "}
          <code className="font-mono text-white">POST /pqc/transparency/keys/retire</code> while preserving previous
          verification capability through key history.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Related guides</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Continue with{" "}
          <Link href="/docs/guides/transparency-witness" className="text-white underline underline-offset-4">
            witness onboarding
          </Link>{" "}
          and <Link href="/docs/guides/verify" className="text-white underline underline-offset-4">verify</Link> for
          external assurance workflows.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
