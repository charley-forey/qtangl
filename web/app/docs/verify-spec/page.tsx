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
  path: "/docs/verify-spec",
  title: "Verify specification",
  description:
    "Qtangl signed report verification spec v1.1.0 — content hash, dual signatures, Merkle inclusion.",
});

export default function VerifySpecPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/verify-spec"
        title="Verify specification"
        description="Offline verification rules for Qtangl signed migration reports."
      />
      <DocsShell
        title="Verify specification v1.1.0"
        description="SHA-256 content hash, dual signatures (ML-DSA-65 + Ed25519), and optional transparency log Merkle inclusion."
        pathname="/docs/verify-spec"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="ga" />
        <DocsSection>
          <DocsHeading>Quick verify</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`pip install qtangl-verify
qtangl-verify report.json --api-base https://api.qtangl.com --json`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Public endpoints</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">GET /pqc/transparency/root</code> — current log root
            </li>
            <li>
              <code className="font-mono text-white">GET /pqc/transparency/keys</code> — signing key history
            </li>
            <li>
              <code className="font-mono text-white">GET /pqc/verify/&#123;scanId&#125;</code> — online verify
            </li>
          </ul>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            No API key required. Public verify and transparency routes share a default limit of{" "}
            <strong className="text-white">60 requests per minute per client IP</strong>. See{" "}
            <Link href="/docs/operations/rate-limits" className="text-white underline underline-offset-4">
              Rate limits &amp; quotas
            </Link>
            .
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Full specification</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Source document maintained in the repository:{" "}
            <Link
              href="https://github.com/qtangl/qtangl/blob/main/docs/verify-spec.md"
              className="text-white underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              docs/verify-spec.md
            </Link>
            .
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Related</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <Link href="/trust" className="text-white underline underline-offset-4">
              Trust center
            </Link>{" "}
            ·{" "}
            <Link href="/verify" className="text-white underline underline-offset-4">
              Verify a report
            </Link>{" "}
            ·{" "}
            <Link href="/docs/integrations/ci-cd" className="text-white underline underline-offset-4">
              CI/CD integration
            </Link>{" "}
            ·{" "}
            <Link href="/docs/operations/rate-limits" className="text-white underline underline-offset-4">
              Rate limits
            </Link>
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
