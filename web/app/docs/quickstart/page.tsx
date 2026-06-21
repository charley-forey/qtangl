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
import { qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";
import {
  curlPqcScan,
  javascriptFetch,
  pollScanStatus,
  pythonRequests,
} from "@/lib/docs/code-samples";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

const pqcScanRequest = { scenarioId: "bank-tls-inventory", useFixture: true, depth: "standard" };
const pqcScanResponse = {
  status: "success",
  scanId: "scan-abc123",
  readinessBand: "At risk",
  reportAvailable: true,
};
const pqcPollResponse = { status: "success", scanId: "scan-abc123", jobStatus: "completed" };

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/quickstart",
  title: "Quickstart",
  description:
    "Run your first PQC scan, download a signed report, and verify evidence independently.",
});

export default function QuickstartPage() {
  const pqcTabs = [
    { id: "curl" as const, label: "curl", code: curlPqcScan(pqcScanRequest) },
    {
      id: "javascript" as const,
      label: "JavaScript",
      code: javascriptFetch("/pqc/scan", "POST", pqcScanRequest),
    },
    {
      id: "python" as const,
      label: "Python",
      code: pythonRequests("/pqc/scan", "POST", pqcScanRequest),
    },
    { id: "response" as const, label: "Response", code: pqcScanResponse },
  ];

  const pollTabs = [
    { id: "curl" as const, label: "Poll status", code: pollScanStatus("scan-abc123") },
    { id: "response" as const, label: "Completed", code: pqcPollResponse },
  ];

  const verifyTabs = [
    {
      id: "curl" as const,
      label: "Public verify",
      code: `curl "${qtanglApiBaseUrl}/pqc/verify/scan-abc123"`,
    },
    {
      id: "response" as const,
      label: "Verification",
      code: { status: "success", verification: { valid: true, algorithm: "ML-DSA-65" } },
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/quickstart"
        title="Quickstart"
        description="Run your first PQC scan and verify signed evidence."
      />
      <DocsShell
        title="Quickstart — PQC assessment"
        description="Assess post-quantum readiness in four steps: scan, poll, report, verify."
        pathname="/docs/quickstart"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>0. Get an API key</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Request pilot access at{" "}
            <Link href="/access" className="text-white underline underline-offset-4">
              /access
            </Link>
            . Monitor tier self-serve returns a one-time onboarding token — see{" "}
            <Link href="/docs/guides/billing-onboarding" className="text-white underline underline-offset-4">
              Billing & onboarding
            </Link>
            .
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>1. Pick your base URL</DocsHeading>
          <Card className="rounded-2xl">
            <div className="space-y-2 font-mono text-sm text-[var(--color-gray-400)]">
              <p>Base URL: {qtanglApiBaseUrl}</p>
              <p>Sandbox key: {qtanglSandboxApiKey}</p>
            </div>
            <Link href="/assess" className="mt-5 inline-block text-sm font-medium text-white underline-offset-4 hover:underline">
              Try the live scanner →
            </Link>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>2. Run a scan</DocsHeading>
          <DocsCodeTabs tabs={pqcTabs} storageKey="qtangl-quickstart-pqc" />
          <DocsCallout variant="tip">
            Send <code className="font-mono text-white">Idempotency-Key</code> on{" "}
            <code className="font-mono text-white">POST /pqc/scan</code> to safely retry without duplicate jobs.
          </DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>3. Poll until complete</DocsHeading>
          <DocsCodeTabs tabs={pollTabs} storageKey="qtangl-quickstart-poll" />
        </DocsSection>

        <DocsSection>
          <DocsHeading>4. Download report & verify</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Download JSON or PDF via{" "}
            <code className="font-mono text-white">GET /pqc/report/{"{scanId}"}?format=pdf</code>. Verify
            independently — no API key required:
          </p>
          <DocsCodeTabs tabs={verifyTabs} storageKey="qtangl-quickstart-verify" />
          <Link href="/verify" className="mt-4 inline-block text-sm text-white underline underline-offset-4">
            Open the public verifier →
          </Link>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Next steps</DocsHeading>
          <DocsCallout variant="tip">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <Link href="/docs/guides/assess">Assess workflow</Link> — end-to-end assessment guide
              </li>
              <li>
                <Link href="/docs/guides/monitor-workflow">Monitor workflow</Link> — scheduled scans and drift
              </li>
              <li>
                <Link href="/docs/authentication">Authentication & RBAC</Link> — roles and key lifecycle
              </li>
              <li>
                <Link href="/docs/verify-spec">Verify specification</Link> — independent evidence verification
              </li>
            </ul>
          </DocsCallout>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
