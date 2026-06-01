import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { siteMetadata } from "@/lib/copy/product";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/security",
  title: "Security",
  description: "TLS, API keys, and responsible disclosure for Qtangl.",
});

export default function SecurityPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/security" title="Security" description="Security practices." />
      <DocsShell
        title="Security & compliance"
        description="Enterprise integrations start with transport security and key hygiene."
        pathname="/docs/operations/security"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Transport</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            All production API traffic must use HTTPS. Do not send API keys over unencrypted
            channels.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Key storage</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Store keys in a secrets manager or deployment environment — never in git.</li>
            <li>Rotate keys on a schedule and after personnel changes.</li>
            <li>Browser sandbox keys are public-by-design; use read-only pilot scopes.</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>CAIQ / SIG (stubs)</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Data classification: customer scan metadata and cryptographic inventory (no PAN).</li>
            <li>Encryption: TLS 1.2+ in transit; optional Fernet for integration secrets at rest.</li>
            <li>Access control: API keys with roles; SSO documented for dashboard (OIDC).</li>
            <li>Logging: audit log API for tenant admin actions.</li>
            <li>SOC 2: Type I in progress — no certification claim on marketing pages.</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Responsible disclosure</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Report security issues to{" "}
            <a
              href={`mailto:${siteMetadata.contactEmail}`}
              className="text-white underline underline-offset-4"
            >
              {siteMetadata.contactEmail}
            </a>
            . We will acknowledge receipt within two business days during the pilot.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Compliance roadmap</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            SOC 2 readiness and formal data processing agreements are planned for production
            tenants. Pilot deployments should not process regulated PHI without a signed agreement.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
