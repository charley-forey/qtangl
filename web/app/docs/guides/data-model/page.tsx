import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/data-model",
  title: "Data model guide",
  description: "Understand multi-tenant boundaries, RLS behavior, and data lifecycle controls including DSAR/offboarding.",
});

export default function DataModelGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/data-model"
      title="Data model guide"
      description="Qtangl data model prioritizes strict tenant isolation, complete auditability, and controlled deletion workflows."
    >
      <DocsSection>
        <DocsHeading>Multi-tenancy and isolation</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Tenant-scoped APIs enforce access boundaries at auth and data layers. Tenant metadata can be retrieved using{" "}
          <code className="font-mono text-white">GET /tenant/me</code>, while admin control plane actions remain on{" "}
          <code className="font-mono text-white">/admin/*</code> endpoints.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>RLS-aware data access patterns</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Use tenant routes such as <code className="font-mono text-white">GET /tenant/scans</code> and{" "}
            <code className="font-mono text-white">GET /tenant/audit</code> for scoped reads.
          </li>
          <li>
            Export tenant-bounded data with <code className="font-mono text-white">GET /tenant/export</code>.
          </li>
          <li>
            Keep cross-tenant workflows in explicit portfolio endpoints only.
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>DSAR and offboarding lifecycle</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          DSAR and tenant decommission workflows should run through{" "}
          <code className="font-mono text-white">DELETE /tenant/data</code> and{" "}
          <code className="font-mono text-white">POST /tenant/offboard</code>. Capture immutable audit exports before
          destructive steps to meet legal hold and compliance obligations.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Governance controls</DocsHeading>
        <DocsCallout variant="warning">
          Never bypass tenant scoping with ad hoc administrative scripts in production paths. When emergency access is
          required, pair every action with <code className="font-mono text-white">GET /tenant/audit/export</code>{" "}
          evidence and documented approval.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
