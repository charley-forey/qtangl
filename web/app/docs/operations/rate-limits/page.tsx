import type { Metadata } from "next";
import Link from "next/link";

import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsEndpointLimitTable from "@/components/docs/DocsEndpointLimitTable";
import DocsErrorTable from "@/components/docs/DocsErrorTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsRateLimitTable from "@/components/docs/DocsRateLimitTable";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import DocsTierQuotaTable from "@/components/docs/DocsTierQuotaTable";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import {
  authenticatedReadonlyExamples,
  authenticatedWriteExamples,
  discoveryLimits,
  publicRateLimitedEndpoints,
  rateLimitCategories,
  rateLimitEnvVars,
  rateLimitErrorRows,
  signupLimits,
  tierQuotas,
} from "@/lib/docs/rate-limits";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/rate-limits",
  title: "Rate limits",
  description:
    "Per-key, per-IP, signup, discovery, and tier quota limits on the Qtangl API — defaults, exemptions, and client patterns.",
});

export default function RateLimitsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/operations/rate-limits"
        title="Rate limits"
        description="Rate limit and quota policy for the Qtangl API."
      />
      <DocsShell
        title="Rate limits & quotas"
        description="Layered limits protect shared infrastructure while keeping scan polling and auditor verify flows unblocked."
        pathname="/docs/operations/rate-limits"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-07-01</p>

        <DocsSection>
          <DocsHeading>Overview</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Qtangl applies limits at several layers. Authenticated <strong className="text-white">write</strong>{" "}
            routes share a per-key requests-per-minute budget. Authenticated <strong className="text-white">read</strong>{" "}
            routes (including PQC scan polling) do not count toward that budget. Public verify, transparency, and
            Readiness Index routes use a separate per-IP limit. Signup and lead-capture forms have abuse caps. Discovery
            and remediation have additional tenant-scoped limits. Monthly scan caps are tier entitlements and return{" "}
            <strong className="text-white">402 Payment Required</strong>, not 429.
          </p>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            For authentication schemes and RBAC, see{" "}
            <Link href="/docs/authentication" className="text-white underline underline-offset-4">
              Authentication &amp; RBAC
            </Link>
            . For key hygiene and transport security, see{" "}
            <Link href="/docs/operations/security" className="text-white underline underline-offset-4">
              Security &amp; compliance
            </Link>
            .
          </p>
          <div className="mt-6">
            <DocsRateLimitTable rows={rateLimitCategories} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Authenticated API — 300 req/min per key</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            The backend enforces <strong className="text-white">300 requests per minute per API key</strong> by
            default on authenticated write routes. Operators can override with{" "}
            <code className="font-mono text-white">QTANGL_RATE_LIMIT_PER_MINUTE</code>; values below 300 are ignored.
            When <code className="font-mono text-white">REDIS_URL</code> is set, counters are distributed across
            instances; otherwise each process keeps an in-memory sliding window.
          </p>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Every response includes informational headers{" "}
            <code className="font-mono text-white">X-RateLimit-Limit</code> and{" "}
            <code className="font-mono text-white">X-RateLimit-Window: 60</code>. Rate-limit counter state uses a
            rolling 60-second window — see{" "}
            <Link href="/docs/operations/data-retention" className="text-white underline underline-offset-4">
              Data retention
            </Link>
            .
          </p>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Routes under <code className="font-mono text-white">/admin/*</code> use a separate admin key and are not
            counted. Unauthenticated health routes are unlimited.
          </p>
          <h3 className="mt-6 text-sm font-medium text-white">Write routes (count toward limit)</h3>
          <div className="mt-3">
            <DocsEndpointLimitTable rows={authenticatedWriteExamples} />
          </div>
          <h3 className="mt-6 text-sm font-medium text-white">Read routes (exempt from global counter)</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
            This exemption is intentional: polling{" "}
            <code className="font-mono text-white">GET /pqc/scan/{"{scanId}"}</code> during a scan workflow does not
            consume your write budget.
          </p>
          <div className="mt-3">
            <DocsEndpointLimitTable rows={authenticatedReadonlyExamples} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Public endpoints — 60 req/min per IP</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Verify, transparency log, Readiness Index, and dogfood routes are public — no API key required. They share
            a default limit of <strong className="text-white">60 requests per minute per client IP</strong>, keyed from{" "}
            <code className="font-mono text-white">X-Forwarded-For</code> or the connection host. Override with{" "}
            <code className="font-mono text-white">QTANGL_VERIFY_RATE_LIMIT_PER_MINUTE</code> and{" "}
            <code className="font-mono text-white">QTANGL_VERIFY_RATE_WINDOW_SEC</code>. Responses include a{" "}
            <code className="font-mono text-white">Retry-After</code> header on 429.
          </p>
          <div className="mt-4">
            <DocsEndpointLimitTable rows={publicRateLimitedEndpoints} showCountsColumn={false} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Signup and lead capture</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Self-serve signup and marketing forms are rate-limited per email domain to reduce abuse.
          </p>
          <div className="mt-4">
            <DocsRateLimitTable rows={signupLimits} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Discovery limits</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Host discovery scan enqueue and agent findings ingest have separate tenant-scoped limits. These require Redis;
            when Redis is unavailable, discovery rate limits are not enforced.
          </p>
          <div className="mt-4">
            <DocsRateLimitTable rows={discoveryLimits} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Tier quotas (402, not 429)</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Monthly scan counts, schedule caps, and API key limits are subscription entitlements. Exceeding a monthly
            scan quota returns <strong className="text-white">402 Payment Required</strong> with a{" "}
            <code className="font-mono text-white">scan_quota_exceeded</code> code — not a rate limit. Production live
            scans also require legal acceptance and trial or paid status.
          </p>
          <div className="mt-4">
            <DocsTierQuotaTable rows={tierQuotas} />
          </div>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Upgrade via the billing portal or{" "}
            <Link href="/pricing" className="text-white underline underline-offset-4">
              pricing
            </Link>
            .
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Remediation flip budget</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Crypto flip automation enforces a policy budget of <strong className="text-white">50 flips per day per
            tenant</strong>, with a <strong className="text-white">24-hour cooldown</strong> between KMS production
            flips. Exceeding the budget returns a policy rejection in the response metadata — not HTTP 429.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>429 and 402 responses</DocsHeading>
          <DocsCodeTabs
            tabs={[
              {
                id: "curl" as const,
                label: "Per-key 429",
                code: `HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 300
X-RateLimit-Window: 60

{
  "detail": "Rate limit reached. The pilot API allows 300 requests per minute per key."
}`,
              },
              {
                id: "response" as const,
                label: "Public verify 429",
                code: `HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "detail": "Verify rate limit exceeded. Try again shortly."
}`,
              },
              {
                id: "typescript" as const,
                label: "Scan quota 402",
                code: {
                  detail: {
                    code: "scan_quota_exceeded",
                    tier: "free",
                    limit: 5,
                    used: 5,
                    upgradeUrl: "/pricing",
                  },
                },
              },
            ]}
          />
          <div className="mt-6">
            <DocsErrorTable errors={[...rateLimitErrorRows]} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Client patterns</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              Poll <code className="font-mono text-white">GET /pqc/scan/{"{scanId}"}</code> freely — read routes are
              exempt from the 300/min write counter.
            </li>
            <li>
              Send <code className="font-mono text-white">Idempotency-Key</code> on{" "}
              <code className="font-mono text-white">POST /pqc/scan</code> to avoid duplicate scans when retrying after
              429 or network errors.
            </li>
            <li>Exponential backoff with jitter on 429; respect <code className="font-mono text-white">Retry-After</code> on public routes.</li>
            <li>Official SDKs (TypeScript and Python) treat 429 as retryable with exponential backoff.</li>
            <li>Cache optimize results when inputs have not changed.</li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Operator environment variables</DocsHeading>
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-[var(--color-gray-950)]">
                <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
                  <th className="px-4 py-3 font-medium">Variable</th>
                  <th className="px-4 py-3 font-medium">Default</th>
                  <th className="px-4 py-3 font-medium">Scope</th>
                </tr>
              </thead>
              <tbody>
                {rateLimitEnvVars.map((row) => (
                  <tr
                    key={row.variable}
                    className="border-b border-[var(--border)]/60 align-top last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-white">{row.variable}</td>
                    <td className="px-4 py-3 font-mono text-[var(--color-gray-300)]">
                      {row.defaultValue}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-gray-300)]">{row.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
