import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import { qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";
import {
  docsQuickstartRequest,
  docsQuickstartResponse,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Submit a basic optimization request and understand the Qtangl response.",
};

export default function QuickstartPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsShell
        title="Quickstart"
        description="This quickstart shows the smallest useful scheduling request: send the work, the constraints, and then inspect the returned summary, plan, and metrics."
      >
        <Card className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">1. Submit a job</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Start with a small scheduling payload. Include a problem type, the tasks
            that must happen, and the rules that cannot break in the final plan.
          </p>
          <div className="mt-5 space-y-2 text-sm leading-7 text-[var(--color-gray-400)]">
            <p>Base URL: {qtanglApiBaseUrl}</p>
            <p>Pilot key: {qtanglSandboxApiKey}</p>
            <p>Request access to receive a real key for the live endpoint.</p>
          </div>
        </Card>

        <CodeBlock title="POST /optimize request" code={docsQuickstartRequest} />

        <CodeBlock
          title="curl example"
          code={`curl -X POST "${qtanglApiBaseUrl}/optimize" \\
  -H "Authorization: Bearer ${qtanglSandboxApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(docsQuickstartRequest, null, 2)}'`}
        />

        <Card strong className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">2. Inspect the response</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Qtangl returns a short summary first, then the structured solution, then
            the metrics and solver details developers may need for deeper inspection.
          </p>
        </Card>

        <CodeBlock title="Response payload" code={docsQuickstartResponse} />
      </DocsShell>
    </div>
  );
}
