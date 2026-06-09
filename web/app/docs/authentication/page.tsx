import type { Metadata } from "next";
import Link from "next/link";

import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import {
  curlGet,
  curlPqcScan,
  pythonRequests,
} from "@/lib/docs/code-samples";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/authentication",
  title: "Authentication & RBAC",
  description:
    "Per-tenant API keys, viewer/operator/admin roles, bearer and header schemes, OIDC SSO, and key lifecycle.",
});

export default function AuthenticationPage() {
  const tabs = [
    {
      id: "curl" as const,
      label: "Bearer (curl)",
      code: curlPqcScan({ scenarioId: "bank-tls-inventory", useFixture: true }),
    },
    {
      id: "javascript" as const,
      label: "x-api-key",
      code: `fetch(url, {
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
    "X-Request-Id": crypto.randomUUID(),
  },
});`,
    },
    {
      id: "python" as const,
      label: "Query param",
      code: pythonRequests("/tenant/me?api_key=YOUR_API_KEY", "GET"),
    },
    {
      id: "typescript" as const,
      label: "Read-only GET",
      code: curlGet("/tenant/scans"),
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/authentication"
        title="Authentication & RBAC"
        description="API keys, roles, and header schemes for Qtangl."
      />
      <DocsShell
        title="Authentication & RBAC"
        description="Each tenant receives scoped API keys with viewer, operator, or admin roles. Platform admin routes use a separate key."
        pathname="/docs/authentication"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>Supported headers</DocsHeading>
          <ul className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">Authorization: Bearer &lt;key&gt;</code> — preferred
              for server-side integrations
            </li>
            <li>
              <code className="font-mono text-white">x-api-key: &lt;key&gt;</code> — convenient for tools
              and proxies
            </li>
            <li>
              <code className="font-mono text-white">?api_key=&lt;key&gt;</code> — read-only catalog
              endpoints only
            </li>
            <li>
              <code className="font-mono text-white">X-Request-Id</code> — optional; echoed on every
              response for support correlation
            </li>
            <li>
              <code className="font-mono text-white">Idempotency-Key</code> — supported on{" "}
              <code className="font-mono text-white">POST /pqc/scan</code>
            </li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>RBAC roles</DocsHeading>
          <Card className="rounded-2xl">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
              <li>
                <strong className="text-white">viewer</strong> — read scans, reports, portfolio,
                analytics; cannot create schedules or modify remediation
              </li>
              <li>
                <strong className="text-white">operator</strong> — default for new keys; scans,
                schedules, remediation writes, integrations
              </li>
              <li>
                <strong className="text-white">admin</strong> — audit log, settings, offboarding,
                billing portal, OIDC config, partner children
              </li>
            </ul>
            <Link href="/docs/reference/rbac" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
              Full RBAC matrix →
            </Link>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Examples</DocsHeading>
          <DocsCodeTabs tabs={tabs} storageKey="qtangl-auth-tab" />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Platform admin key</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Routes under <code className="font-mono text-white">/admin/*</code> require{" "}
            <code className="font-mono text-white">QTANGL_ADMIN_API_KEY</code> — not a tenant role. Used
            for tenant provisioning and key lifecycle. See{" "}
            <Link href="/docs/guides/admin-keys" className="text-white underline underline-offset-4">
              Admin & key lifecycle
            </Link>
            .
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Dashboard SSO (OIDC)</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Dashboard login supports OIDC SSO configured via{" "}
            <code className="font-mono text-white">PUT /tenant/oidc</code> (admin role). API keys remain
            required for programmatic access. See{" "}
            <Link href="/docs/guides/sso-setup" className="text-white underline underline-offset-4">
              Dashboard SSO setup
            </Link>
            .
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Key rotation</DocsHeading>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Issue a new key via admin API or deployment environment.</li>
            <li>Update clients to send the new header value.</li>
            <li>Revoke the old key after traffic drains — keys stored as SHA-256 hashes; plaintext shown once.</li>
          </ol>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Public routes</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <code className="font-mono text-white">GET /health</code>,{" "}
            <code className="font-mono text-white">GET /pqc/verify/{"{scanId}"}</code>, transparency log
            endpoints, and Readiness Index are public (rate-limited). All{" "}
            <code className="font-mono text-white">/tenant/*</code> and mutating{" "}
            <code className="font-mono text-white">/pqc/*</code> routes require a valid tenant key.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
