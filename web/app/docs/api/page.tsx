import type { Metadata } from "next";

import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/DocsShell";
import {
  apiErrors,
  apiReferenceRequest,
  apiReferenceResponse,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "API Guide",
  description: "Authentication, rate limits, and the `/optimize` flow for Qtangl.",
};

export default function DocsApiPage() {
  return (
    <DocsShell
      title="API guide"
      description="The MVP centers on one endpoint: `/optimize`. Developers submit a problem, Qtangl runs the solver workflow, and the service returns a structured result."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <CodeBlock title="Request schema" code={apiReferenceRequest} />
        <CodeBlock title="Response schema" code={apiReferenceResponse} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Authentication</h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The MVP assumes API-key based authentication. Requests include a bearer
            token or API key header managed by the client application.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold text-white">Rate limits</h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            MVP rate limiting is capped at 10 requests per minute per API key. This
            is enough for testing and pilot workflows without overcomplicating usage.
          </p>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-semibold text-white">Error handling</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
          {apiErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </section>
    </DocsShell>
  );
}
