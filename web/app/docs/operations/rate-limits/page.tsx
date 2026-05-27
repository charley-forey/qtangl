import type { Metadata } from "next";

import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/rate-limits",
  title: "Rate limits",
  description: "Per-key rate limiting on the Qtangl pilot API (default 120 requests per minute).",
});

export default function RateLimitsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/rate-limits" title="Rate limits" description="Rate limit policy." />
      <DocsShell
        title="Rate limits"
        description="Protect shared pilot infrastructure while keeping integration tests unblocked."
        pathname="/docs/operations/rate-limits"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Default policy</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            The backend enforces <strong className="text-white">120 requests per minute per API key</strong>{" "}
            by default. Operators can override with the{" "}
            <code className="font-mono text-white">QTANGL_RATE_LIMIT_PER_MINUTE</code> environment
            variable on the server.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>429 response</DocsHeading>
          <DocsCodeTabs
            tabs={[
              {
                id: "curl" as const,
                label: "HTTP",
                code: "HTTP/1.1 429 Too Many Requests",
              },
              {
                id: "response" as const,
                label: "Body",
                code: {
                  detail:
                    "Rate limit reached. The pilot API allows 120 requests per minute per key.",
                },
              },
            ]}
          />
        </DocsSection>
        <DocsSection>
          <DocsHeading>Client patterns</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Token-bucket or leaky-bucket limiter in your integration layer.</li>
            <li>Exponential backoff with jitter on 429.</li>
            <li>Cache optimize results when inputs have not changed.</li>
          </ul>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
