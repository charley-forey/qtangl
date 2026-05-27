import type { Metadata } from "next";
import Link from "next/link";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { siteMetadata } from "@/lib/copy/product";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/support",
  title: "Support",
  description: "Pilot support channels and escalation for Qtangl integrators.",
});

export default function SupportPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/resources/support" title="Support" description="Get help." />
      <DocsShell
        title="Support"
        description="Direct line to the team during the pilot program."
        pathname="/docs/resources/support"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Contact</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Email{" "}
            <a
              href={`mailto:${siteMetadata.contactEmail}`}
              className="text-white underline underline-offset-4"
            >
              {siteMetadata.contactEmail}
            </a>{" "}
            with your organization, use case, and request id if available.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Response targets (pilot)</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Integration questions — 1 business day</li>
            <li>Production incidents — same day when tagged urgent</li>
            <li>Security reports — acknowledgment within 2 business days</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Before you write</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              Check <Link href="/docs/resources/faq">FAQ</Link> and{" "}
              <Link href="/docs/errors">Errors</Link>
            </li>
            <li>Include problem type, payload shape, and HTTP status</li>
            <li>Redact API keys and PHI from attachments</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Access & onboarding</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            New pilot keys and production discussions start at{" "}
            <Link href="/access" className="text-white underline underline-offset-4">
              /access
            </Link>
            .
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
