import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

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

const downloadButtonClass =
  "inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-black/30 px-4 py-2.5 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.06]";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

function readArtifactMeta(relativePath: string) {
  try {
    const absolutePath = join(process.cwd(), "public", relativePath);
    const stat = statSync(absolutePath);
    return { bytes: stat.size, label: formatBytes(stat.size), missing: false };
  } catch {
    return { bytes: 0, label: "—", missing: true };
  }
}

export default function SdksPage() {
  const openapiMeta = readArtifactMeta("openapi.json");
  const openapi = JSON.parse(readFileSync(join(process.cwd(), "public/openapi.json"), "utf8")) as {
    info?: { version?: string; title?: string };
  };
  const postmanMeta = readArtifactMeta("postman/qtangl-api.json");
  const corpusMeta = readArtifactMeta("downloads/docs-corpus.md");
  const bundleMeta = readArtifactMeta("downloads/qtangl-agent-bundle.zip");
  const apiVersion = openapi.info?.version ?? "0.9.0";

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

  const downloads = [
    {
      href: "/openapi.json",
      download: "qtangl-openapi.json",
      title: "openapi.json",
      description: `${openapi.info?.title ?? "Qtangl API"} v${apiVersion}`,
      size: openapiMeta.label,
    },
    {
      href: "/postman/qtangl-api.json",
      download: "qtangl-api.postman.json",
      title: "Postman collection",
      description: "Import into Postman or Insomnia",
      size: postmanMeta.label,
    },
    {
      href: "/downloads/docs-corpus.md",
      download: "qtangl-docs-corpus.md",
      title: "docs-corpus.md",
      description: "Full markdown corpus for LLM and agent context",
      size: corpusMeta.label,
    },
    {
      href: "/downloads/qtangl-agent-bundle.zip",
      download: "qtangl-agent-bundle.zip",
      title: "Agent bundle (.zip)",
      description: "AGENTS.md, schemas, OpenAPI, verify spec, sample CBOM",
      size: bundleMeta.label,
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/sdks" title="SDKs, CLI & OpenAPI" description="Integration tooling." />
      <DocsShell
        title="SDKs, CLI & OpenAPI"
        description="Official SDK packages, qtangl-verify CLI, OpenAPI artifact, and Postman collection."
        pathname="/docs/sdks"
        searchIndex={docsSearchIndex}
        lastUpdated="2026-06-14"
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-14</p>

        <DocsSection>
          <DocsHeading>Official SDKs (v0.9.1)</DocsHeading>
          <DocsCallout variant="info">
            Published beta packages with generated types, retries, idempotency helpers, and resource groups for
            monitor (<code className="font-mono text-white">client.monitor</code>), CBOM (
            <code className="font-mono text-white">client.cbom</code>), and reports (
            <code className="font-mono text-white">client.reports</code>).
          </DocsCallout>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-2xl">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">@qtangl/sdk (TypeScript)</p>
              </div>
              <p className="mt-3 text-sm text-[var(--color-gray-300)]">
                npm package — OpenAPI-generated types, retries, idempotency, public verify endpoints.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-black/40 p-3 text-xs text-[var(--color-gray-300)]">
{`npm install @qtangl/sdk

import { QtanglClient, newIdempotencyKey } from "@qtangl/sdk";

const client = new QtanglClient({
  baseUrl: "${qtanglApiBaseUrl}",
  apiKey: process.env.QTANGL_API_KEY!,
});`}
              </pre>
            </Card>
            <Card className="rounded-2xl">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">qtangl (Python)</p>
              </div>
              <p className="mt-3 text-sm text-[var(--color-gray-300)]">
                PyPI package — Pydantic models, retries, idempotency, offline verify via qtangl-verify.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-black/40 p-3 text-xs text-[var(--color-gray-300)]">
{`pip install qtangl

from qtangl import QtanglClient, new_idempotency_key

client = QtanglClient(base_url="${qtanglApiBaseUrl}", api_key="your-key")`}
              </pre>
            </Card>
          </div>
          <p className="mt-4 text-xs text-[var(--color-gray-500)]">
            Release tag: <code className="font-mono text-white">sdk-v0.9.1</code> publishes both packages. Examples in{" "}
            <code className="font-mono text-white">sdk/examples/</code>.
          </p>
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
          <DocsHeading>Downloads</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Machine-readable artifacts for codegen, Postman, and agentic systems. Regenerated on each
            release build.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {downloads.map((item) => (
              <Card key={item.href} className="rounded-2xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-[var(--color-gray-400)]">{item.description}</p>
                  </div>
                  <span className="text-xs text-[var(--color-gray-500)]">{item.size}</span>
                </div>
                <a
                  href={item.href}
                  download={item.download}
                  className={`${downloadButtonClass} mt-4`}
                >
                  Download {item.title}
                </a>
              </Card>
            ))}
          </div>
          <DocsCallout variant="tip">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Browse OpenAPI inline:{" "}
                <a href="/openapi.json" className="text-white underline underline-offset-4">
                  /openapi.json
                </a>{" "}
                (Swagger UI at <code className="font-mono">/docs</code> on the API host)
              </li>
              <li>
                URL index for crawlers:{" "}
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
            <li>
              Load <code className="font-mono text-white">AGENTS.md</code> from the agent bundle into Cursor,
              Claude Projects, or internal copilots.
            </li>
          </ul>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
