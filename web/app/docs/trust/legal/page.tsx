import type { Metadata } from "next";
import Link from "next/link";

import GuidePageLayout from "@/components/docs/GuidePageLayout";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/trust/legal",
  title: "Legal artifacts",
  description: "DPA, MSA, cookie notice, and enterprise contract requests.",
});

export default function TrustLegalPage() {
  return (
    <GuidePageLayout
      pathname="/docs/trust/legal"
      title="Legal artifacts"
      description="Self-serve terms and privacy summaries are published; executed agreements are available on request."
    >
      <DocsSection>
        <DocsHeading>Published policies</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            <Link href="/terms" className="text-white underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            — self-serve summary (not executed MSA)
          </li>
          <li>
            <Link href="/privacy" className="text-white underline underline-offset-4">
              Privacy Policy
            </Link>{" "}
            — data categories and sub-processors
          </li>
          <li>
            <Link href="/trust/subprocessors" className="text-white underline underline-offset-4">
              Sub-processor register
            </Link>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Enterprise agreements (on request)</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Executed DPA, MSA, BAA (where applicable), and custom data processing addenda are available for
          enterprise and regulated customers via{" "}
          <Link href="/access" className="text-white underline underline-offset-4">
            /access
          </Link>
          . Outline templates are maintained internally for legal review — not published as binding contracts.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Cookie & analytics notice</DocsHeading>
        <DocsCallout variant="honesty">
          Optional PostHog/GA analytics on the marketing site only when enabled. No third-party analytics cookies
          on authenticated dashboard routes. Cookie preferences can be managed via browser settings; enterprise
          deployments may disable analytics entirely.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
