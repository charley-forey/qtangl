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
        <DocsHeading>Download</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Platform SBOM (CycloneDX 1.6):{" "}
          <Link href="/downloads/qtangl-platform.cdx.json" className="text-white underline underline-offset-4">
            qtangl-platform.cdx.json
          </Link>
          . Regenerated via <code className="text-white">scripts/generate-platform-sbom.mjs</code> and CI supply-chain
          workflows.
        </p>
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
        <DocsCallout variant="honesty">
          Point-in-time exports for a specific release tag are available during enterprise security review.
        </DocsCallout>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Contact via{" "}
          <Link href="/access?interest=Security%20diligence%20(DPA%20/%20SOC%202%20/%20questionnaires)" className="text-white underline underline-offset-4">
            /access
          </Link>{" "}
          with your security questionnaire reference.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
