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
import { docsGuideCopy } from "@/lib/copy/docs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/quickstart",
  title: "Quickstart",
  description:
    "Send your first planning job and inspect the ranked plan, measurements, and method details Qtangl returns.",
});

export default function QuickstartPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsShell
        title={docsGuideCopy.quickstart.title}
        description={docsGuideCopy.quickstart.description}
      >
        <Card className="rounded-2xl">
          <p className="text-label">{docsGuideCopy.quickstart.submit.eyebrow}</p>
          <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.quickstart.submit.title}</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            {docsGuideCopy.quickstart.submit.description}
          </p>
          <div className="mt-5 space-y-2 text-sm leading-7 text-[var(--color-gray-400)]">
            <p>Base URL: {qtanglApiBaseUrl}</p>
            <p>Pilot key: {qtanglSandboxApiKey}</p>
            <p>{docsGuideCopy.quickstart.submit.notes[2]}</p>
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
          <p className="text-label">{docsGuideCopy.quickstart.inspect.eyebrow}</p>
          <h2 className="text-2xl font-semibold text-white">{docsGuideCopy.quickstart.inspect.title}</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            {docsGuideCopy.quickstart.inspect.description}
          </p>
        </Card>

        <CodeBlock title="Response payload" code={docsQuickstartResponse} />
      </DocsShell>
    </div>
  );
}
