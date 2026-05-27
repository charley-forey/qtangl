import type { Metadata } from "next";

import Link from "next/link";

import CodeBlock from "@/components/docs/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { qtanglApiBaseUrl } from "@/lib/api";
import {
  apiErrors,
  apiReferenceRequest,
  apiReferenceResponse,
} from "@/lib/constants";
import { docsGuideCopy } from "@/lib/copy/docs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/api",
  title: "API Guide",
  description:
    "Understand the `/optimize` flow, method honesty, and returned measurements so you can integrate quickly.",
});

export default function DocsApiPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsShell
        title={docsGuideCopy.api.title}
        description={docsGuideCopy.api.description}
      >
        <Card className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">
            {docsGuideCopy.api.conciseEndpoint.title}
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            {docsGuideCopy.api.conciseEndpoint.description}
          </p>
          <Link
            href="/api"
            className="touch-target mt-6 inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
          >
            {docsGuideCopy.api.conciseEndpoint.cta}
          </Link>
        </Card>

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <CodeBlock title="Request schema" code={apiReferenceRequest} />
          <CodeBlock title="Response schema" code={apiReferenceResponse} />
        </div>

        <Card className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.api.whatYouGetBack.title}</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {docsGuideCopy.api.whatYouGetBack.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.api.pilotEndpoint.title}</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            {docsGuideCopy.api.pilotEndpoint.description}{" "}
            <span className="font-mono text-white">{qtanglApiBaseUrl}</span>.
          </p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card as="section" className="rounded-2xl">
            <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.api.auth.title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {docsGuideCopy.api.auth.description}
            </p>
          </Card>

          <Card as="section" strong className="rounded-2xl">
            <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.api.rateLimits.title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {docsGuideCopy.api.rateLimits.description}
            </p>
          </Card>
        </div>

        <Card as="section" strong className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.api.methodHonesty.title}</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            {docsGuideCopy.api.methodHonesty.description}
          </p>
        </Card>

        <Card as="section" className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.api.errors.title}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {apiErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Card>
      </DocsShell>
    </div>
  );
}
