import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/portfolio-mssp",
  title: "Portfolio and MSSP guide",
  description: "Operate multi-tenant portfolios and partner-managed child workspaces with clear control boundaries.",
});

export default function PortfolioMsspGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/portfolio-mssp"
      title="Portfolio and MSSP guide"
      description="Manage parent-child tenant structures for holding companies, MSSPs, and regional operating groups."
    >
      <DocsSection>
        <DocsHeading>Operating model</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Portfolio mode aggregates posture across multiple tenants while preserving each tenant&apos;s isolation and audit
          trail. MSSP mode adds managed-service child relationships and delegated runbook execution.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Portfolio APIs</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Read portfolio summary: <code className="font-mono text-white">GET /tenant/portfolio</code>
          </li>
          <li>
            Update portfolio settings: <code className="font-mono text-white">PATCH /tenant/portfolio</code>
          </li>
          <li>
            Cross-tenant command center: <code className="font-mono text-white">GET /tenant/portfolio/command-center</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>MSSP partner children</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            List managed children: <code className="font-mono text-white">GET /tenant/partner/children</code>
          </li>
          <li>
            Register/update child tenant: <code className="font-mono text-white">POST /tenant/partner/children</code>
          </li>
        </ul>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Child-scoped actions should still execute with child credentials, even when orchestration is initiated from a
          parent command center.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Governance and evidence</DocsHeading>
        <DocsCallout variant="info">
          Keep per-tenant evidence boundaries intact. Portfolio dashboards may aggregate metrics, but exported evidence
          should remain attributable to source tenant ids using{" "}
          <code className="font-mono text-white">GET /tenant/export</code> and{" "}
          <code className="font-mono text-white">GET /tenant/audit/export</code>.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
