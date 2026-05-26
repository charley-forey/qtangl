import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import Card from "@/components/ui/Card";
import { qtanglApiBaseUrl } from "@/lib/api";
import {
  apiErrors,
  apiReferenceRequest,
  apiReferenceResponse,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "API Guide",
  description:
    "Understand the `/optimize` flow so you can submit jobs and read results quickly.",
};

export default function DocsApiPage() {
  return (
    <DocsShell
      title="API guide"
      description="The MVP centers on one endpoint: `/optimize`. Developers submit a planning problem, Qtangl evaluates feasible options, and the service returns a summary, metrics, and structured result."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <CodeBlock title="Request schema" code={apiReferenceRequest} />
        <CodeBlock title="Response schema" code={apiReferenceResponse} />
      </div>

      <Card className="rounded-2xl">
        <h2 className="text-2xl font-semibold text-white">What you get back</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
          <p>
            `summary` is the first thing humans should read. It explains what the
            plan accomplished in plain language.
          </p>
          <p>
            `metrics` highlight value: duration, violations, savings, or other
            numbers the team already tracks.
          </p>
          <p>
            `details` hold solver metadata for developers and evaluators without
            forcing every user to understand the optimization stack.
          </p>
        </div>
      </Card>

      <Card className="rounded-2xl">
        <h2 className="text-2xl font-semibold text-white">Pilot endpoint</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          Point your pilot client to <span className="font-mono text-white">{qtanglApiBaseUrl}</span>.
          Set `NEXT_PUBLIC_QTANGL_API_BASE_URL` when the staging backend is deployed.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card as="section" className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">Authentication</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            The MVP assumes API-key based authentication. Requests include a bearer
            token or API key header managed by the client application.
          </p>
        </Card>

        <Card as="section" strong className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">Rate limits</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            MVP rate limiting is capped at 10 requests per minute per API key. This
            is enough for testing and pilot workflows without overcomplicating usage.
          </p>
        </Card>
      </div>

      <Card as="section" className="rounded-2xl">
        <h2 className="text-2xl font-semibold text-white">Error handling</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
          {apiErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </Card>
    </DocsShell>
  );
}
