import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/conventions",
  title: "API conventions",
  description: "Request and response conventions for pagination, idempotency, request ids, and retry behavior.",
});

const requestHeaders: DocsFieldRow[] = [
  {
    name: "Authorization",
    type: "Bearer <api_key>",
    required: true,
    description: "Tenant API key with scope appropriate for the endpoint group.",
  },
  {
    name: "Idempotency-Key",
    type: "string",
    required: false,
    description: "Required for create and mutate calls where safe retries are needed.",
  },
  {
    name: "X-Request-Id",
    type: "string",
    required: false,
    description: "Client-generated correlation id echoed by the API and included in audit trails.",
  },
  {
    name: "Content-Type",
    type: "application/json",
    required: true,
    description: "Default request media type unless endpoint docs specify multipart or alternative formats.",
  },
];

const retryPolicy: DocsFieldRow[] = [
  { name: "429 Too Many Requests", type: "retryable", required: true, description: "Retry with exponential backoff and jitter after honoring server pacing guidance." },
  { name: "500 Internal Server Error", type: "retryable", required: true, description: "Retry with bounded attempts. Escalate with request id if persistent." },
  { name: "502/503/504", type: "retryable", required: true, description: "Retryable infrastructure/transient errors. Prefer capped exponential backoff." },
  { name: "400/401/403/404", type: "non-retryable", required: true, description: "Do not blind-retry. Fix auth, permissions, input shape, or resource id first." },
];

export default function ApiConventionsPage() {
  return (
    <GuidePageLayout
      pathname="/docs/operations/conventions"
      title="API conventions"
      description="Cross-endpoint behaviors that keep enterprise integrations predictable and supportable."
    >
      <DocsSection>
        <DocsHeading>Pagination</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Collection endpoints use cursor-based pagination when result sets can grow materially over time. Responses
          include an opaque cursor token for the next page and stable ordering guarantees for deterministic sync loops.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`GET /v1/pqc/inventory?limit=100&cursor=eyJvZmZzZXQiOjEwMH0=
{
  "items": [...],
  "nextCursor": "eyJvZmZzZXQiOjIwMH0=",
  "hasMore": true
}`}
        </pre>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Idempotency for writes</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          For mutation endpoints, include <code className="font-mono text-white">Idempotency-Key</code> to guarantee
          replay-safe behavior when clients retry after network interruptions.
        </p>
        <DocsCallout variant="tip" title="Key generation">
          Generate one UUID per business operation (not per HTTP attempt) and reuse it across retries for up to 24
          hours.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Request and response headers</DocsHeading>
        <DocsFieldTable fields={requestHeaders} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>Content types</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Default request and response media type is{" "}
            <code className="font-mono text-white">application/json; charset=utf-8</code>.
          </li>
          <li>
            File uploads use <code className="font-mono text-white">multipart/form-data</code> when documented on the
            endpoint.
          </li>
          <li>
            Report exports may return binary content with explicit{" "}
            <code className="font-mono text-white">Content-Type</code> and{" "}
            <code className="font-mono text-white">Content-Disposition</code> headers.
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Retries and backoff</DocsHeading>
        <DocsFieldTable fields={retryPolicy} />
      </DocsSection>
    </GuidePageLayout>
  );
}
