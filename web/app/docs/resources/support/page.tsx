import type { Metadata } from "next";
import Link from "next/link";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { siteMetadata } from "@/lib/copy/product";
import { statusPageHref } from "@/lib/siteConfig";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/support",
  title: "Support & SLA",
  description: "Pilot support channels, response targets, and status page.",
});

export default function SupportPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/resources/support" title="Support & SLA" description="Get help." />
      <DocsShell
        title="Support & SLA"
        description="Direct line to the team during pilot and enterprise deployments."
        pathname="/docs/resources/support"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>System status</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Live uptime and incident history:{" "}
            <a href={statusPageHref} className="text-white underline underline-offset-4">
              {statusPageHref}
            </a>
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Contact</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Email{" "}
            <a href={`mailto:${siteMetadata.contactEmail}`} className="text-white underline underline-offset-4">
              {siteMetadata.contactEmail}
            </a>{" "}
            with your organization, use case, and <code className="font-mono text-white">requestId</code> from API
            error responses when available.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Response targets</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Pilot integration questions — 1 business day</li>
            <li>Production incidents — same day when tagged urgent</li>
            <li>Security reports — acknowledgment within 2 business days</li>
            <li>Enterprise SLA — custom targets by MSA (typically 4h P1 / 1 business day P2)</li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Before you write</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              Check <Link href="/docs/resources/faq">FAQ</Link>,{" "}
              <Link href="/docs/errors">Errors</Link>, and{" "}
              <Link href="/docs/operations/conventions">API conventions</Link>
            </li>
            <li>Include HTTP method, path, status code, and redacted request shape</li>
            <li>Redact API keys and regulated data from attachments</li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Access & onboarding</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            New pilot keys and production discussions start at{" "}
            <Link href="/access" className="text-white underline underline-offset-4">
              /access
            </Link>
            . Monitor self-serve:{" "}
            <Link href="/docs/guides/billing-onboarding" className="text-white underline underline-offset-4">
              Billing & onboarding
            </Link>
            .
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
