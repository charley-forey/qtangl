import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/sso-setup",
  title: "Dashboard SSO (OIDC)",
  description: "Configure OIDC for dashboard access; API keys remain for automation.",
});

export default function SsoSetupPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/sso-setup"
        title="Dashboard SSO (OIDC)"
        description="Map your IdP to tenant roles for dashboard access."
      />
      <DocsShell
        title="Dashboard SSO"
        description="Map your IdP (Okta, Azure AD, Google Workspace) to tenant roles. Programmatic access continues via API keys."
        pathname="/docs/guides/sso-setup"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="ga" />
        <DocsSection>
          <DocsHeading>Environment</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`AUTH_OIDC_ISSUER=https://your-idp.example.com
AUTH_OIDC_CLIENT_ID=...
AUTH_OIDC_CLIENT_SECRET=...
AUTH_DASHBOARD_REQUIRE_SSO=true
# Map claim to tenant (customize in deployment)`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Dashboard flow</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Users sign in at <code className="font-mono text-white">/api/auth/oidc/login</code>. On success, the
            dashboard auto-provisions a session-scoped tenant API key. Automation and CI continue to use
            long-lived tenant keys issued by admin.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Related</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <Link href="/trust/security" className="text-white underline underline-offset-4">
              Security architecture
            </Link>{" "}
            ·{" "}
            <Link href="/dashboard" className="text-white underline underline-offset-4">
              Dashboard
            </Link>
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
