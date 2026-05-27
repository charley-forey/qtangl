import type { Metadata } from "next";
import Link from "next/link";

import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsQuickstartRequest } from "@/lib/constants";
import { javascriptFetch, pythonRequests } from "@/lib/docs/code-samples";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/authentication",
  title: "Authentication",
  description: "API keys, bearer tokens, and header schemes for the Qtangl pilot API.",
});

export default function AuthenticationPage() {
  const tabs = [
    {
      id: "curl" as const,
      label: "Bearer (curl)",
      code: `curl -X POST "…/optimize" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '…'`,
    },
    {
      id: "javascript" as const,
      label: "x-api-key",
      code: `fetch(url, {
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
});`,
    },
    {
      id: "python" as const,
      label: "Python",
      code: pythonRequests("/optimize", "POST", docsQuickstartRequest),
    },
    {
      id: "typescript" as const,
      label: "Full example",
      code: javascriptFetch("/optimize", "POST", docsQuickstartRequest),
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/authentication"
        title="Authentication"
        description="API keys and header schemes for Qtangl."
      />
      <DocsShell
        title="Authentication"
        description="Send a bearer token or x-api-key header on every protected route. The pilot defaults to a single shared key per deployment."
        pathname="/docs/authentication"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Supported headers</DocsHeading>
          <ul className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">Authorization: Bearer &lt;key&gt;</code> —
              preferred for server-side integrations
            </li>
            <li>
              <code className="font-mono text-white">x-api-key: &lt;key&gt;</code> — convenient for
              tools and proxies
            </li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Examples</DocsHeading>
          <DocsCodeTabs tabs={tabs} storageKey="qtangl-auth-tab" />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Pilot vs production keys</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Pilot keys are suitable for sandbox, staging, and integration tests. Request production
            credentials via{" "}
            <Link href="/access" className="text-white underline underline-offset-4">
              /access
            </Link>
            . Never commit keys to source control — use environment variables (
            <code className="font-mono text-white">QTANGL_API_KEY</code> on the server,{" "}
            <code className="font-mono text-white">NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY</code> in the
            browser sandbox only).
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Key rotation</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Issue a new key in your deployment environment.</li>
            <li>Update clients to send the new header value.</li>
            <li>Revoke the old key after traffic drains.</li>
          </ol>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Public routes</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <code className="font-mono text-white">GET /health</code> does not require
            authentication. All <code className="font-mono text-white">/optimize</code> and{" "}
            <code className="font-mono text-white">/hospital/*</code> routes require a valid key.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
