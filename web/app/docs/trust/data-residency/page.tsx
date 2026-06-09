import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/trust/data-residency",
  title: "Data residency",
  description: "Regional data residency options and handling matrix for US and EU deployment models.",
});

export default function DataResidencyDocsPage() {
  return (
    <GuidePageLayout
      pathname="/docs/trust/data-residency"
      title="Data residency"
      description="Regional hosting guidance for organizations with US or EU data location requirements."
    >
      <DocsSection>
        <DocsHeading>Residency model</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Qtangl supports a default US deployment profile and an EU profile for enterprise agreements that require
          regional processing controls. Residency commitments are defined contractually and reflected in deployment
          architecture.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>US vs EU residency matrix</DocsHeading>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-[var(--color-gray-950)]">
              <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
                <th className="px-4 py-3 font-medium">Data category</th>
                <th className="px-4 py-3 font-medium">US profile</th>
                <th className="px-4 py-3 font-medium">EU profile</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Tenant metadata</td>
                <td className="px-4 py-3">Stored and processed in US region.</td>
                <td className="px-4 py-3">Stored and processed in EU region.</td>
                <td className="px-4 py-3">Includes organization settings, identity mappings, and routing metadata.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Scan findings</td>
                <td className="px-4 py-3">US-at-rest by default.</td>
                <td className="px-4 py-3">EU-at-rest in contracted EU deployment.</td>
                <td className="px-4 py-3">Used by remediation, reporting, and trend analytics pipelines.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Evidence bundles</td>
                <td className="px-4 py-3">US object storage.</td>
                <td className="px-4 py-3">EU object storage where configured.</td>
                <td className="px-4 py-3">Customer export destinations can be region-aligned.</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60 align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Webhook payloads</td>
                <td className="px-4 py-3">Emitted from US control plane.</td>
                <td className="px-4 py-3">Emitted from EU control plane.</td>
                <td className="px-4 py-3">Destination endpoints are customer-controlled and may be cross-region.</td>
              </tr>
              <tr className="align-top">
                <td className="px-4 py-3 font-mono text-xs text-white">Support artifacts</td>
                <td className="px-4 py-3">Case data handled in US-centric workflow.</td>
                <td className="px-4 py-3">EU-handling process by agreement.</td>
                <td className="px-4 py-3">Minimize sensitive payload data in support attachments.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Cross-region controls</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Cross-region transfer requirements are managed through contract and technical guardrails.</li>
          <li>Data export and integration destinations remain under customer configuration control.</li>
          <li>Retention and deletion requirements can be aligned to regional legal obligations.</li>
        </ul>
        <DocsCallout variant="info" title="Commercial note">
          EU data residency is generally provisioned as an enterprise deployment profile and may require additional
          contractual terms.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
