import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsErrorTable from "@/components/docs/DocsErrorTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { errorEnvelopeFields } from "@/lib/docs/errors";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/errors",
  title: "Errors & status codes",
  description: "HTTP errors, retry guidance, and the Qtangl error envelope.",
});

export default function ErrorsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/errors"
        title="Errors & status codes"
        description="HTTP error reference for Qtangl API."
      />
      <DocsShell
        title="Errors & status codes"
        description="Every failure path should be actionable for operators and engineers."
        pathname="/docs/errors"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>Error envelope</DocsHeading>
          <CodeBlock
            title="Typical error body"
            code={{
              status: "error",
              message: "Invalid API key. Check the pilot token and try again.",
              requestId: "req_01JABCDEF",
              detail: "optional string or validation object",
            }}
          />
          <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
            Send <code className="font-mono text-white">X-Request-Id</code> on requests; the same value is echoed on
            error responses for support correlation.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Envelope fields</DocsHeading>
          <DocsErrorTable errors={errorEnvelopeFields} />
        </DocsSection>

        <DocsSection>
          <DocsHeading>HTTP status codes</DocsHeading>
          <DocsErrorTable />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Retry guidance</DocsHeading>
          <DocsCallout variant="warning">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-white">402</strong> — entitlement upgrade required; do not retry without
                billing change.
              </li>
              <li>
                <strong className="text-white">429</strong> — exponential backoff with jitter; do not hammer the same
                key.
              </li>
              <li>
                <strong className="text-white">503</strong> — persistence or dependency unavailable; retry reads with
                backoff (schedules require Postgres).
              </li>
              <li>
                <strong className="text-white">5xx</strong> — retry idempotent GETs; for POST /pqc/scan use{" "}
                <code className="font-mono text-white">Idempotency-Key</code>.
              </li>
              <li>
                <strong className="text-white">422</strong> — fix inputs; retries without changes will not succeed.
              </li>
            </ul>
          </DocsCallout>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
