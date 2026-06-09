import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import DocsBadge from "@/components/docs/DocsBadge";
import {
  curlPqcScan,
  javascriptFetch,
  pythonRequests,
} from "@/lib/docs/code-samples";
import { qtanglApiBaseUrl } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";
import { docsSearchIndex } from "@/lib/docs/search-index-export";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/sdks",
  title: "SDKs, CLI & OpenAPI",
  description: "HTTP client recipes, qtangl-verify CLI, OpenAPI artifact, and Postman collection.",
});

export default function SdksPage() {
  const tabs = [
    { id: "curl" as const, label: "PQC scan", code: curlPqcScan({ scenarioId: "bank-tls-inventory", useFixture: true }) },
    {
      id: "javascript" as const,
      label: "Poll status",
      code: javascriptFetch("/pqc/scan/scan-abc123", "GET"),
    },
    {
      id: "python" as const,
      label: "Tenant scans",
      code: pythonRequests("/tenant/scans", "GET"),
    },
    {
      id: "typescript" as const,
      label: "Public verify",
      code: `curl "${qtanglApiBaseUrl}/pqc/verify/scan-abc123"`,
    },
  ];

  const cliSnippet = `# Offline verification (no dashboard login)
pip install qtangl-verify
qtangl-verify scan-abc123 --api ${process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com"}

# Verify pasted report JSON
qtangl-verify --json report.json`;

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/sdks" title="SDKs, CLI & OpenAPI" description="Integration tooling." />
      <DocsShell
        title="SDKs, CLI & OpenAPI"
        description="Use any HTTP client against the JSON API today. Official typed SDKs are on the roadmap."
        pathname="/docs/sdks"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>Official SDKs</DocsHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-2xl">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">@qtangl/sdk (TypeScript)</p>
                <DocsBadge status="coming-soon" />
              </div>
              <p className="mt-3 text-sm text-[var(--color-gray-300)]">
                Typed models, retries, idempotency helpers, and verify utilities.
              </p>
            </Card>
            <Card className="rounded-2xl">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">qtangl (Python)</p>
                <DocsBadge status="coming-soon" />
              </div>
              <p className="mt-3 text-sm text-[var(--color-gray-300)]">
                Pydantic request/response models and CLI utilities.
              </p>
            </Card>
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>qtangl-verify CLI</DocsHeading>
          <DocsCallout variant="info">
            Shipped in v0.9.0 — recompute content hashes, verify ML-DSA-65 signatures, and check
            transparency log inclusion offline.
          </DocsCallout>
          <pre className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-black/40 p-4 text-sm text-[var(--color-gray-300)]">
            {cliSnippet}
          </pre>
          <Link href="/docs/verify-spec" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
            Verify specification →
          </Link>
        </DocsSection>

        <DocsSection>
          <DocsHeading>HTTP recipes (today)</DocsHeading>
          <DocsCodeTabs tabs={tabs} storageKey="qtangl-sdks-tab" />
        </DocsSection>

        <DocsSection>
          <DocsHeading>OpenAPI & Postman</DocsHeading>
          <DocsCallout variant="info">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Interactive OpenAPI:{" "}
                <a href="/openapi.json" className="text-white underline underline-offset-4">
                  /openapi.json
                </a>{" "}
                (also at <code className="font-mono">/docs</code> on deployed backend)
              </li>
              <li>
                Postman collection:{" "}
                <a href="/postman/qtangl-api.json" className="text-white underline underline-offset-4">
                  /postman/qtangl-api.json
                </a>
              </li>
              <li>
                Machine-readable index:{" "}
                <a href="/llms.txt" className="text-white underline underline-offset-4">
                  /llms.txt
                </a>
              </li>
            </ul>
          </DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Integration tips</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Poll <code className="font-mono text-white">GET /pqc/scan/{"{id}"}</code> until job completes.</li>
            <li>Send <code className="font-mono text-white">Idempotency-Key</code> on scan POST for safe retries.</li>
            <li>Verify reports publicly — auditors need no API key.</li>
            <li>Handle 402 for entitlement-gated Monitor features.</li>
          </ul>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
