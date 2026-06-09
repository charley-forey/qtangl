import type { Metadata } from "next";
import Link from "next/link";

import CodeBlock from "@/components/docs/CodeBlock";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import FeatureCard from "@/components/marketing/FeatureCard";
import { qtanglApiBaseUrl } from "@/lib/api";
import { docsEndpoints } from "@/lib/docs/endpoints";
import { endpointDocsHref } from "@/lib/docs/endpoint-paths";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/api",
  title: "API Guide",
  description:
    "PQC scan lifecycle, tenant Monitor APIs, verify & transparency, and signed evidence workflows.",
});

const coreLinks = [
  { id: "pqc-scan", label: "POST /pqc/scan" },
  { id: "pqc-scan-status", label: "GET /pqc/scan/{scanId}" },
  { id: "pqc-report", label: "GET /pqc/report/{scanId}" },
  { id: "pqc-verify-get", label: "GET /pqc/verify/{scanId}" },
  { id: "tenant-me", label: "GET /tenant/me" },
  { id: "tenant-scans", label: "GET /tenant/scans" },
  { id: "tenant-schedules-create", label: "POST /tenant/schedules" },
  { id: "health", label: "GET /health" },
] as const;

const pqcFlow = `1. POST /pqc/scan (Idempotency-Key optional)
2. GET  /pqc/scan/{scanId} until status=success
3. GET  /pqc/report/{scanId}?format=pdf|json|cbom|bundle
4. GET  /pqc/verify/{scanId} (public, no API key)
5. POST /tenant/scans/{scanId}/share for auditor passport`;

export default function DocsApiPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/api" title="API Guide" description="PQC and tenant API guide." />
      <DocsShell
        title="API Guide — PQC Readiness"
        description="Assess cryptographic inventory, monitor drift on a schedule, and export independently verifiable evidence."
        pathname="/docs/api"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>Core endpoints</DocsHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            {coreLinks.map((link) => (
              <FeatureCard
                key={link.id}
                title={link.label}
                description={docsEndpoints[link.id]?.summary ?? ""}
                href={endpointDocsHref(link.id)}
              />
            ))}
            <FeatureCard
              title="RBAC & scopes"
              description="Viewer, operator, and admin role matrix."
              href="/docs/reference/rbac"
            />
            <FeatureCard
              title="Errors & status codes"
              description="401, 402, 403, 404, 413, 422, 429, 500, 503."
              href="/docs/errors"
            />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Assess flow</DocsHeading>
          <Card tone="strong" className="rounded-2xl">
            <CodeBlock title="Typical integration" code={pqcFlow} />
            <Link href="/docs/guides/assess" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
              Full Assess workflow →
            </Link>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Monitor tier</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Scheduled scans via <code className="font-mono text-white">POST /tenant/schedules</code>, drift
            alerts via tenant settings, and SIEM export via signed webhooks (
            <Link href="/docs/integrations/webhooks" className="text-white underline underline-offset-4">
              webhooks guide
            </Link>
            ).
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Pilot endpoint</DocsHeading>
          <Card className="rounded-2xl">
            <p className="text-sm leading-8 text-[var(--color-gray-300)]">
              Base URL: <span className="font-mono text-white">{qtanglApiBaseUrl}</span>
            </p>
            <Link href="/docs/operations/environments" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
              Environments guide →
            </Link>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Labs / optimization</DocsHeading>
          <DocsCallout variant="info">
            <code className="font-mono text-xs">POST /optimize</code> and domain demos (hospital, airline,
            ev-fleet) remain available under{" "}
            <Link href="/docs/reference/optimize">Labs reference</Link>. Primary product documentation
            focuses on Q-Day readiness.
          </DocsCallout>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
