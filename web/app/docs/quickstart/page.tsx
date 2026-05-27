import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import DocsTryIt from "@/components/docs/DocsTryIt";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";
import { docsQuickstartRequest, docsQuickstartResponse } from "@/lib/constants";
import { docsGuideCopy } from "@/lib/copy/docs";
import {
  curlOptimize,
  javascriptFetch,
  pythonRequests,
  typescriptFetch,
} from "@/lib/docs/code-samples";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/quickstart",
  title: "Quickstart",
  description:
    "Send your first planning job and inspect the ranked plan, measurements, and method details Qtangl returns.",
});

export default function QuickstartPage() {
  const tabs = [
    { id: "curl" as const, label: "curl", code: curlOptimize(docsQuickstartRequest) },
    {
      id: "javascript" as const,
      label: "JavaScript",
      code: javascriptFetch("/optimize", "POST", docsQuickstartRequest),
    },
    {
      id: "python" as const,
      label: "Python",
      code: pythonRequests("/optimize", "POST", docsQuickstartRequest),
    },
    {
      id: "typescript" as const,
      label: "TypeScript",
      code: typescriptFetch("/optimize", "POST", docsQuickstartRequest),
    },
    {
      id: "response" as const,
      label: "Response",
      code: docsQuickstartResponse,
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/quickstart"
        title={docsGuideCopy.quickstart.title}
        description={docsGuideCopy.quickstart.description}
      />
      <DocsShell
        title={docsGuideCopy.quickstart.title}
        description={docsGuideCopy.quickstart.description}
        pathname="/docs/quickstart"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>0. Get an API key</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Request pilot access at{" "}
            <Link href="/access" className="text-white underline underline-offset-4">
              /access
            </Link>
            . For local development, set{" "}
            <code className="font-mono text-white">NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY</code>.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>1. Pick your base URL</DocsHeading>
          <Card className="rounded-2xl">
            <p className="text-label">{docsGuideCopy.quickstart.submit.eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">
              {docsGuideCopy.quickstart.submit.title}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {docsGuideCopy.quickstart.submit.description}
            </p>
            <div className="mt-5 space-y-2 font-mono text-sm text-[var(--color-gray-400)]">
              <p>Base URL: {qtanglApiBaseUrl}</p>
              <p>Pilot key: {qtanglSandboxApiKey}</p>
            </div>
            <Link
              href="/sandbox"
              className="mt-5 inline-block text-sm font-medium text-white underline-offset-4 hover:underline"
            >
              Try it in the API sandbox →
            </Link>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>2. Send the request</DocsHeading>
          <DocsCodeTabs tabs={tabs} />
          <DocsTryIt
            body={docsQuickstartRequest as Record<string, unknown>}
            fallbackResponse={docsQuickstartResponse}
          />
        </DocsSection>

        <DocsSection>
          <DocsHeading>3. Read the response</DocsHeading>
          <Card strong className="rounded-2xl">
            <p className="text-label">{docsGuideCopy.quickstart.inspect.eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">
              {docsGuideCopy.quickstart.inspect.title}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {docsGuideCopy.quickstart.inspect.description}
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--color-gray-400)]">
              <li>
                <strong className="text-white">summary</strong> — plain-English outcome
              </li>
              <li>
                <strong className="text-white">solution</strong> — executable plan
              </li>
              <li>
                <strong className="text-white">metrics</strong> — violations and savings
              </li>
              <li>
                <strong className="text-white">method</strong> — classical or hybrid label
              </li>
            </ul>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>4. Handle errors</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            401 means fix your key. 422 means adjust constraints or problem shape. 429 means slow
            down. See{" "}
            <Link href="/docs/errors" className="text-white underline underline-offset-4">
              Errors & status codes
            </Link>
            .
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>5. Next steps</DocsHeading>
          <DocsCallout variant="tip">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <Link href="/docs/data-formats">Data formats</Link> — field reference per problem
                type
              </li>
              <li>
                <Link href="/docs/reference/optimize">POST /optimize</Link> — full API reference
              </li>
              <li>
                <Link href="/docs/concepts">Concepts</Link> — hybrid execution and method honesty
              </li>
            </ul>
          </DocsCallout>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
