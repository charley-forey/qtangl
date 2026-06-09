import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/cloud-import",
  title: "Cloud import guide",
  description: "Import KMS, Keyfactor, and CLM inventories into tenant and CBOM workflows.",
});

export default function CloudImportGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/cloud-import"
      title="Cloud import guide"
      description="Connect cloud and PKI providers, test connectivity, then pull inventories into scan and CBOM pipelines."
    >
      <DocsSection>
        <DocsHeading>Supported import paths</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Imports can run through tenant integration endpoints for environment-specific operation or through CBOM pull
          endpoints when you need direct aggregation updates.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>1) Configure provider credentials</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Generic cloud import: <code className="font-mono text-white">POST /tenant/cloud-import</code>
          </li>
          <li>
            Cloud provider config:{" "}
            <code className="font-mono text-white">POST /tenant/integrations/cloud/{"{provider}"}</code>
          </li>
          <li>
            Keyfactor integration: <code className="font-mono text-white">POST /tenant/integrations/keyfactor</code>
          </li>
          <li>
            CLM provider integration:{" "}
            <code className="font-mono text-white">POST /tenant/integrations/clm/{"{clm_provider}"}</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>2) Validate connectivity</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Run integration checks before ingestion:
          <code className="font-mono text-white"> POST /tenant/integrations/cloud/{"{provider}"}/test</code>,
          <code className="font-mono text-white"> POST /tenant/integrations/keyfactor/test</code>, and
          <code className="font-mono text-white"> POST /tenant/integrations/clm/{"{clm_provider}"}/test</code>.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>3) Pull and normalize inventory</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Trigger tenant-level import with <code className="font-mono text-white">POST /tenant/integrations/pull</code>
          {" "}or run CBOM-specific source pulls with{" "}
          <code className="font-mono text-white">POST /pqc/cbom/pull/{"{provider}"}</code>. Use{" "}
          <code className="font-mono text-white">GET /pqc/cbom/aggregate</code> for normalized output and{" "}
          <code className="font-mono text-white">GET /tenant/integrations</code> for source health.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>4) Connect to scan workflows</DocsHeading>
        <DocsCallout variant="tip">
          After a successful import, launch a new <code className="font-mono text-white">POST /pqc/scan</code> to
          compute current exposure against the refreshed asset inventory. This keeps remediation planning in sync with
          actual key and certificate state.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
