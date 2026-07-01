import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsErrorTable from "@/components/docs/DocsErrorTable";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import DocsTryIt from "@/components/docs/DocsTryIt";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import {
  curlGet,
  curlOptimize,
  curlPost,
  javascriptFetch,
  pythonRequests,
  typescriptFetch,
} from "@/lib/docs/code-samples";
import { httpErrors } from "@/lib/docs/errors";
import { endpointDocsHref } from "@/lib/docs/endpoint-paths";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { endpointSupportsTryIt, resolveDocsRequestPath } from "@/lib/docs/try-it";
import type { DocsEndpoint } from "@/lib/docs/types";

type ReferenceEndpointPageProps = {
  endpoint: DocsEndpoint;
  metadataDescription: string;
};

function buildTabs(endpoint: DocsEndpoint) {
  const example = endpoint.examples[0];
  const requestPath = resolveDocsRequestPath(endpoint) ?? endpoint.path;
  const body =
    example?.request && typeof example.request === "object"
      ? (example.request as Record<string, unknown>)
      : undefined;

  if (endpoint.method === "GET") {
    return [
      { id: "curl" as const, label: "curl", code: curlGet(requestPath) },
      {
        id: "javascript" as const,
        label: "JavaScript",
        code: javascriptFetch(requestPath, "GET"),
      },
      {
        id: "python" as const,
        label: "Python",
        code: pythonRequests(requestPath, "GET"),
      },
      {
        id: "typescript" as const,
        label: "TypeScript",
        code: typescriptFetch(requestPath, "GET"),
      },
      {
        id: "response" as const,
        label: "Response",
        code: example?.response ?? {},
      },
    ];
  }

  const curlFn =
    endpoint.method === "POST"
      ? curlPost
      : () => curlOptimize(body ?? {});

  return [
    {
      id: "curl" as const,
      label: "curl",
      code: curlFn(requestPath, body ?? {}),
    },
    {
      id: "javascript" as const,
      label: "JavaScript",
      code: javascriptFetch(requestPath, endpoint.method, body),
    },
    {
      id: "python" as const,
      label: "Python",
      code: pythonRequests(requestPath, endpoint.method, body),
    },
    {
      id: "typescript" as const,
      label: "TypeScript",
      code: typescriptFetch(requestPath, endpoint.method, body),
    },
    {
      id: "response" as const,
      label: "Response",
      code: example?.response ?? {},
    },
  ];
}

export default function ReferenceEndpointPage({
  endpoint,
  metadataDescription,
}: ReferenceEndpointPageProps) {
  const pathname = endpointDocsHref(endpoint.id);
  const example = endpoint.examples[0];
  const tryItPath = resolveDocsRequestPath(endpoint);
  const showTryIt = endpointSupportsTryIt(endpoint) && tryItPath !== null;
  const filteredErrors = endpoint.errors
    ? httpErrors.filter((row) => endpoint.errors!.includes(row.code))
    : httpErrors;

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname={pathname} title={endpoint.title} description={metadataDescription} />
      <DocsShell
        title={endpoint.title}
        description={metadataDescription}
        pathname={pathname}
        searchIndex={docsSearchIndex}
      >
        <div className="flex flex-wrap items-center gap-3">
          {endpoint.status && endpoint.status !== "ga" ? (
            <DocsBadge status={endpoint.status} />
          ) : null}
          <span className="font-mono text-sm text-[var(--color-gray-300)]">
            {endpoint.method} {endpoint.path}
          </span>
          {endpoint.auth ? (
            <span className="text-xs text-[var(--color-gray-500)]">
              Auth: {endpoint.role ?? "API key required"}
            </span>
          ) : (
            <span className="text-xs text-[var(--color-gray-500)]">Public</span>
          )}
          {endpoint.idempotency ? (
            <span className="text-xs text-[var(--color-gray-500)]">Idempotency-Key supported</span>
          ) : null}
        </div>

        <DocsSection>
          <DocsHeading>Summary</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">{endpoint.summary}</p>
          {endpoint.rateLimit ? (
            <p className="text-sm text-[var(--color-gray-500)]">Rate limit: {endpoint.rateLimit}</p>
          ) : null}
          {endpoint.contentType ? (
            <p className="text-sm text-[var(--color-gray-500)]">
              Response content type: {endpoint.contentType}
            </p>
          ) : null}
          {endpoint.pagination ? (
            <p className="text-sm text-[var(--color-gray-500)]">Pagination: {endpoint.pagination}</p>
          ) : null}
        </DocsSection>

        {endpoint.notes?.length ? (
          <DocsCallout variant="honesty">
            <ul className="list-disc space-y-2 pl-5">
              {endpoint.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </DocsCallout>
        ) : null}

        <DocsSection>
          <DocsHeading>Example</DocsHeading>
          <DocsCodeTabs
            tabs={buildTabs(endpoint)}
            storageKey={`qtangl-${endpoint.id}-tab`}
            defaultTab="response"
          />
        </DocsSection>

        {showTryIt ? (
          <DocsTryIt
            path={tryItPath}
            method={endpoint.method}
            auth={endpoint.auth}
            body={
              example?.request && typeof example.request === "object"
                ? (example.request as Record<string, unknown>)
                : undefined
            }
            fallbackResponse={(example?.response as object) ?? { status: "success" }}
          />
        ) : null}

        {endpoint.queryParams?.length ? (
          <DocsSection>
            <DocsHeading level={3}>Query parameters</DocsHeading>
            <DocsFieldTable fields={endpoint.queryParams} />
          </DocsSection>
        ) : null}

        {endpoint.requestFields?.length ? (
          <DocsSection>
            <DocsHeading>Request body</DocsHeading>
            <DocsFieldTable fields={endpoint.requestFields} />
          </DocsSection>
        ) : null}

        {endpoint.formatMatrix?.length ? (
          <DocsSection>
            <DocsHeading>Format matrix</DocsHeading>
            <DocsFieldTable fields={endpoint.formatMatrix} />
          </DocsSection>
        ) : null}

        {endpoint.responseFields?.length ? (
          <DocsSection>
            <DocsHeading>Response</DocsHeading>
            <DocsFieldTable fields={endpoint.responseFields} />
          </DocsSection>
        ) : null}

        <DocsSection>
          <DocsHeading>Errors</DocsHeading>
          <DocsErrorTable errors={filteredErrors} />
          <p className="text-sm text-[var(--color-gray-500)]">
            See the full{" "}
            <Link href="/docs/errors" className="text-white underline underline-offset-4">
              errors reference
            </Link>
            .
          </p>
        </DocsSection>

        <Card className="rounded-2xl">
          <p className="text-label">Related</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/docs/api" className="text-white underline underline-offset-4">
                API guide
              </Link>
            </li>
            <li>
              <Link href="/docs/authentication" className="text-white underline underline-offset-4">
                Authentication and RBAC
              </Link>
            </li>
            <li>
              <Link href="/sandbox" className="text-white underline underline-offset-4">
                API sandbox
              </Link>
            </li>
          </ul>
        </Card>
      </DocsShell>
    </div>
  );
}
