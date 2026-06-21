import type { Metadata } from "next";
import Link from "next/link";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/report-formats",
  title: "Report formats & exports",
  description:
    "Choose among json, csv, cbom, pdf, bundle, executive, board, and auditor report formats for scans and sharing.",
});

export default function ReportFormatsGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/report-formats"
      title="Report formats & exports"
      description="Qtangl reports ship in eight formats. Pick the artifact that matches your audience — engineering, board, or auditor."
      lastUpdated="2026-06-21"
    >
      <DocsSection>
        <DocsHeading>API endpoints</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/reference/pqc/report" className="text-white underline underline-offset-4">
              GET /pqc/report/{"{scanId}"}
            </Link>{" "}
            — immediate post-scan download
          </li>
          <li>
            <Link href="/docs/reference/tenant/scan-report" className="text-white underline underline-offset-4">
              GET /tenant/scans/{"{scan_id}"}/report
            </Link>{" "}
            — tenant-persisted scans (dashboard exports)
          </li>
          <li>
            <Link href="/docs/reference/pqc/report-availability" className="text-white underline underline-offset-4">
              GET /pqc/report/{"{scan_id}"}/availability
            </Link>{" "}
            — check which formats are ready
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Format matrix</DocsHeading>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm text-[var(--color-gray-300)]">
            <thead>
              <tr className="border-b border-[var(--color-gray-700)] text-[var(--color-gray-400)]">
                <th className="py-2 pr-4 font-medium">format=</th>
                <th className="py-2 pr-4 font-medium">Content type</th>
                <th className="py-2 font-medium">Best for</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["json", "application/json", "Integrations, SIEM, custom dashboards"],
                ["csv", "text/csv", "Spreadsheet analysis of findings"],
                ["cbom", "application/json", "CycloneDX CBOM merge into aggregate inventory"],
                ["pdf", "application/pdf", "Full migration report with charts"],
                ["bundle", "application/zip", "Evidence ZIP with signed artifacts"],
                ["executive", "application/json", "CISO one-pager JSON for digest email"],
                ["board", "application/json", "Board-ready KPI summary JSON"],
                ["auditor", "application/json", "Auditor handoff with verify links"],
              ].map(([format, type, use]) => (
                <tr key={format} className="border-b border-[var(--color-gray-800)]">
                  <td className="py-2 pr-4 font-mono text-white">{format}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{type}</td>
                  <td className="py-2">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Sharing & passports</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Create expiring share links with{" "}
          <Link href="/docs/reference/tenant/share-create" className="text-white underline underline-offset-4">
            POST /tenant/scans/{"{scan_id}"}/share
          </Link>
          . Set <code className="font-mono text-white">scope</code> to{" "}
          <code className="font-mono text-white">report</code> (PDF only),{" "}
          <code className="font-mono text-white">bundle</code> (ZIP evidence), or{" "}
          <code className="font-mono text-white">passport</code> (full handoff). Recipients open{" "}
          <code className="font-mono text-white">/r/{"{token}"}</code> without an API key.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Bulk export</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Export multiple scans from the dashboard or via{" "}
          <Link href="/docs/reference/tenant/scans-bulk-export" className="text-white underline underline-offset-4">
            POST /tenant/scans/bulk-export
          </Link>
          .
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Related</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          <Link href="/docs/guides/report-branding" className="text-white underline underline-offset-4">
            Report branding
          </Link>{" "}
          ·{" "}
          <Link href="/docs/guides/verify" className="text-white underline underline-offset-4">
            Verify concept
          </Link>{" "}
          ·{" "}
          <Link href="/docs/data-formats" className="text-white underline underline-offset-4">
            Data formats
          </Link>
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
