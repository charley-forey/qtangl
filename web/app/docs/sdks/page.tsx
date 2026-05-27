import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { docsQuickstartRequest } from "@/lib/constants";
import {
  curlOptimize,
  javascriptFetch,
  pythonRequests,
  typescriptFetch,
} from "@/lib/docs/code-samples";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/sdks",
  title: "SDKs & integrations",
  description: "HTTP client recipes today; official TypeScript and Python SDKs coming soon.",
});

export default function SdksPage() {
  const tabs = [
    { id: "curl" as const, label: "curl", code: curlOptimize(docsQuickstartRequest) },
    {
      id: "javascript" as const,
      label: "fetch",
      code: javascriptFetch("/optimize", "POST", docsQuickstartRequest),
    },
    {
      id: "python" as const,
      label: "requests",
      code: pythonRequests("/optimize", "POST", docsQuickstartRequest),
    },
    {
      id: "typescript" as const,
      label: "TypeScript",
      code: typescriptFetch("/optimize", "POST", docsQuickstartRequest),
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/sdks"
        title="SDKs & integrations"
        description="Integrate Qtangl with HTTP clients today."
      />
      <DocsShell
        title="SDKs & integrations"
        description="Use any HTTP client against the JSON API today. Official typed SDKs are on the roadmap."
        pathname="/docs/sdks"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Official SDKs</DocsHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-2xl">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">@qtangl/sdk (TypeScript)</p>
                <DocsBadge status="coming-soon" />
              </div>
              <p className="mt-3 text-sm text-[var(--color-gray-300)]">
                Typed models, retries, and method-honesty helpers.
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
          <DocsHeading>HTTP recipes (today)</DocsHeading>
          <DocsCodeTabs tabs={tabs} />
        </DocsSection>

        <DocsSection>
          <DocsHeading>OpenAPI</DocsHeading>
          <DocsCallout variant="info">
            FastAPI serves interactive docs at <code className="font-mono">/docs</code> on your
            deployed backend. A published OpenAPI artifact and Postman collection are planned —
            see the{" "}
            <Link href="/docs/resources/roadmap" className="text-white underline underline-offset-4">
              roadmap
            </Link>
            .
          </DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Integration tips</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Read summary before solution — operators trust the narrative first.</li>
            <li>Persist details.diagnostics for audit and method comparisons.</li>
            <li>Handle 422 as a planning signal, not a transport failure.</li>
            <li>Use idempotent retries only on 5xx and network errors, not on 422.</li>
          </ul>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
