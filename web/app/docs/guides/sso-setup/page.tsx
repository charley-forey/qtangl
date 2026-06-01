import Link from "next/link";

import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Dashboard SSO (OIDC) | Qtangl Docs",
  description: "Configure OIDC for dashboard access; API keys remain for automation.",
};

export default function SsoSetupPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-12">
      <header>
        <Eyebrow>Enterprise</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold text-white">Dashboard SSO</h1>
        <p className="mt-3 text-[var(--muted)]">
          Map your IdP (Okta, Azure AD, Google Workspace) to tenant roles. Programmatic access continues via API keys.
        </p>
      </header>
      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">Environment</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`AUTH_OIDC_ISSUER=https://your-idp.example.com
AUTH_OIDC_CLIENT_ID=...
AUTH_OIDC_CLIENT_SECRET=...
# Map claim to tenant (customize in deployment)`}
        </pre>
      </Card>
      <p className="text-sm">
        <Link href="/trust/security" className="text-white underline">
          Security architecture
        </Link>
      </p>
    </article>
  );
}
