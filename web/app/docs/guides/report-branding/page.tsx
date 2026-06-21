import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/report-branding",
  title: "Report branding",
  description: "Customize PDF and shared report appearance with company name, logo, and primary color.",
});

export default function ReportBrandingGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/report-branding"
      title="Report branding"
      description="Tenant admins configure white-label report styling under Dashboard → Settings. Values persist in tenant settings."
      lastUpdated="2026-06-21"
    >
      <DocsSection>
        <DocsHeading>Dashboard UI</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Open{" "}
          <Link href="/dashboard" className="text-white underline underline-offset-4">
            Dashboard
          </Link>{" "}
          → <strong className="font-medium text-white">Settings</strong> →{" "}
          <strong className="font-medium text-white">Report branding</strong>. Set:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <code className="font-mono text-white">companyName</code> — title block on PDF cover
          </li>
          <li>
            <code className="font-mono text-white">logoUrl</code> — HTTPS URL to a PNG/SVG logo (max recommended width
            240px)
          </li>
          <li>
            <code className="font-mono text-white">primaryColor</code> — hex accent for headings and charts (e.g.{" "}
            <code className="font-mono text-white">#1a4fd6</code>)
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>API</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Branding is stored under <code className="font-mono text-white">settings.reportBranding</code> on the tenant
          record. Read with{" "}
          <Link href="/docs/reference/tenant/settings-get" className="text-white underline underline-offset-4">
            GET /tenant/settings
          </Link>
          ; update with{" "}
          <Link href="/docs/reference/tenant/settings-put" className="text-white underline underline-offset-4">
            PUT /tenant/settings
          </Link>{" "}
          by merging the existing settings object:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
          {`{
  "settings": {
    "reportBranding": {
      "companyName": "Acme Corp",
      "logoUrl": "https://cdn.example.com/logo.png",
      "primaryColor": "#1a4fd6"
    }
  }
}`}
        </pre>
        <DocsCallout variant="tip">
          PDF generation applies branding on the next report request. Cached PDFs may need a fresh{" "}
          <code className="font-mono text-white">format=pdf</code> download.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Related</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          <Link href="/docs/guides/report-formats" className="text-white underline underline-offset-4">
            Report formats
          </Link>{" "}
          ·{" "}
          <Link href="/docs/guides/dashboard-team-roles" className="text-white underline underline-offset-4">
            Dashboard team &amp; roles
          </Link>
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
