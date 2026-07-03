import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/executive-digest",
  title: "Executive digest email",
  description: "Preview and send weekly executive readiness digests from the dashboard or tenant API.",
});

export default function ExecutiveDigestGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/executive-digest"
      title="Executive digest"
      description="The weekly digest summarizes readiness KPIs, trend deltas, and open critical items for CISO and board recipients."
      lastUpdated="2026-06-21"
    >
      <DocsSection>
        <DocsHeading>Dashboard workflow</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Open{" "}
            <Link href="/command-center" className="text-white underline underline-offset-4">
              Dashboard
            </Link>{" "}
            as an <code className="font-mono text-white">admin</code>.
          </li>
          <li>
            In <strong className="font-medium text-white">Settings</strong>, locate the digest panel.
          </li>
          <li>
            Click <strong className="font-medium text-white">Preview</strong> to render HTML without sending.
          </li>
          <li>
            Click <strong className="font-medium text-white">Send test</strong> to deliver to your inbox or a specified
            recipient.
          </li>
        </ol>
      </DocsSection>

      <DocsSection>
        <DocsHeading>API</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/docs/reference/tenant/dashboard-digest-preview" className="text-white underline underline-offset-4">
              POST /tenant/dashboard/digest/preview
            </Link>{" "}
            — render digest body (admin role)
          </li>
          <li>
            <Link
              href="/docs/reference/tenant/dashboard-digest-send-test"
              className="text-white underline underline-offset-4"
            >
              POST /tenant/dashboard/digest/send-test
            </Link>{" "}
            — send test email; optional <code className="font-mono text-white">email</code> override in body
          </li>
          <li>
            <Link href="/docs/reference/tenant/dashboard-summary" className="text-white underline underline-offset-4">
              GET /tenant/dashboard/summary
            </Link>{" "}
            includes the current <code className="font-mono text-white">digest</code> object used to compose the email
          </li>
        </ul>
        <DocsCallout variant="info">
          Production digests are sent on the scheduler cadence when Monitor tier and email provider are configured. Test
          sends do not affect production schedules.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Report content</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Digest links reference{" "}
          <code className="font-mono text-white">format=executive</code> and board PDF exports. See{" "}
          <Link href="/docs/guides/report-formats" className="text-white underline underline-offset-4">
            Report formats
          </Link>{" "}
          for the full matrix.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
