import type { Metadata } from "next";
import Link from "next/link";

import GuidePageLayout from "@/components/docs/GuidePageLayout";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/trust/product-sbom",
  title: "Product SBOM",
  description: "Qtangl platform software bill of materials (dogfood CBOM).",
});

export default function ProductSbomPage() {
  return (
    <GuidePageLayout
      pathname="/docs/trust/product-sbom"
      title="Product SBOM / CBOM"
      description="Qtangl publishes a CycloneDX SBOM for platform components — we dogfood our own CBOM workflow."
    >
      <DocsSection>
        <DocsHeading>Status</DocsHeading>
        <DocsCallout variant="honesty">
          Product SBOM generation is in progress. Enterprise customers may request a point-in-time CycloneDX export
          during security review. Customer-facing CBOM ingest/aggregate APIs are GA — see{" "}
          <Link href="/docs/guides/cbom" className="text-white underline underline-offset-4">
            CBOM aggregator guide
          </Link>
          .
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>What we include</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Backend Python dependencies (requirements.lock)</li>
          <li>Web frontend npm lockfile dependencies</li>
          <li>Container base images and signing toolchain versions</li>
          <li>PQC libraries (liboqs when enabled)</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Request access</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Contact enterprise sales via{" "}
          <Link href="/access" className="text-white underline underline-offset-4">
            /access
          </Link>{" "}
          with your security questionnaire reference.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
