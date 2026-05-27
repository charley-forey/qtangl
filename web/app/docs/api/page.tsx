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
import {
  apiErrors,
  apiReferenceRequest,
  apiReferenceResponse,
} from "@/lib/constants";
import { apiReferencePageCopy, docsGuideCopy } from "@/lib/copy/docs";
import { docsEndpoints } from "@/lib/docs/endpoints";
import { endpointDocsHref } from "@/lib/docs/endpoint-paths";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/api",
  title: "API Guide",
  description:
    "Understand the `/optimize` flow, method honesty, and returned measurements so you can integrate quickly.",
});

const referenceLinks = [
  { id: "optimize", label: "POST /optimize" },
  { id: "health", label: "GET /health" },
  { id: "hospital-roster", label: "Hospital roster" },
  { id: "hospital-callout-solve", label: "Hospital solve" },
] as const;

export default function DocsApiPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/api"
        title={docsGuideCopy.api.title}
        description={docsGuideCopy.api.description}
      />
      <DocsShell
        title={docsGuideCopy.api.title}
        description={docsGuideCopy.api.description}
        pathname="/docs/api"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Endpoint map</DocsHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            {referenceLinks.map((link) => (
              <FeatureCard
                key={link.id}
                title={link.label}
                description={docsEndpoints[link.id]?.summary ?? ""}
                href={endpointDocsHref(link.id)}
              />
            ))}
            <FeatureCard
              title="Errors & status codes"
              description="401, 422, 429, 500, 501 with fixes."
              href="/docs/errors"
            />
            <FeatureCard
              title="JSON schemas"
              description="Canonical request and response contracts."
              href="/docs/reference/schemas"
            />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>POST /optimize</DocsHeading>
          <Card className="rounded-2xl">
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {docsGuideCopy.api.conciseEndpoint.description}
            </p>
            <Link
              href="/docs/reference/optimize"
              className="touch-target mt-6 inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
            >
              Full /optimize reference
            </Link>
          </Card>
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <CodeBlock title="Request schema" code={apiReferenceRequest} />
            <CodeBlock title="Response schema" code={apiReferenceResponse} />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>What you get back</DocsHeading>
          <Card className="rounded-2xl">
            <div className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {docsGuideCopy.api.whatYouGetBack.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Execution flow</DocsHeading>
          <Card tone="strong" className="rounded-2xl">
            <ol className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {apiReferencePageCopy.executionFlow.steps.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Pilot endpoint</DocsHeading>
          <Card className="rounded-2xl">
            <p className="text-sm leading-8 text-[var(--color-gray-300)]">
              {docsGuideCopy.api.pilotEndpoint.description}{" "}
              <span className="font-mono text-white">{qtanglApiBaseUrl}</span>.
            </p>
            <Link
              href="/docs/operations/environments"
              className="mt-4 inline-block text-sm text-white underline underline-offset-4"
            >
              Environments guide →
            </Link>
          </Card>
        </DocsSection>

        <div className="grid gap-6 md:grid-cols-2">
          <DocsSection>
            <DocsHeading>Authentication</DocsHeading>
            <Card className="rounded-2xl">
              <p className="text-sm leading-8 text-[var(--color-gray-300)]">
                {docsGuideCopy.api.auth.description}
              </p>
              <Link
                href="/docs/authentication"
                className="mt-4 inline-block text-sm text-white underline underline-offset-4"
              >
                Authentication guide →
              </Link>
            </Card>
          </DocsSection>

          <DocsSection>
            <DocsHeading>Rate limits</DocsHeading>
            <Card strong className="rounded-2xl">
              <p className="text-sm leading-8 text-[var(--color-gray-300)]">
                {docsGuideCopy.api.rateLimits.description}
              </p>
              <Link
                href="/docs/operations/rate-limits"
                className="mt-4 inline-block text-sm text-white underline underline-offset-4"
              >
                Rate limits guide →
              </Link>
            </Card>
          </DocsSection>
        </div>

        <DocsSection>
          <DocsHeading>Method honesty</DocsHeading>
          <DocsCallout variant="honesty">
            {docsGuideCopy.api.methodHonesty.description}
          </DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Error handling</DocsHeading>
          <Card className="rounded-2xl">
            <ul className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {apiErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[var(--color-gray-400)]">
              {apiReferencePageCopy.errorCases.note}
            </p>
          </Card>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
