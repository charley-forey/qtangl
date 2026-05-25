import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import Card from "@/components/ui/Card";
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
    <DocsShell
      title="Quickstart"
      description="This quickstart shows the simplest possible optimization request: define a scheduling problem, submit it to `/optimize`, and inspect the returned system state."
    >
      <Card className="rounded-2xl">
        <h2 className="text-2xl font-semibold text-white">1. Submit a job</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          Start with a small scheduling payload. Include a problem type, a list of
          tasks, and the constraints that must remain true in the final plan.
        </p>
      </Card>

      <CodeBlock title="POST /optimize request" code={docsQuickstartRequest} />

      <Card strong className="rounded-2xl">
        <h2 className="text-2xl font-semibold text-white">2. Inspect the response</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
          Qtangl returns a structured solution plus execution metadata. For the MVP,
          this lets developers review how the schedule was ordered and which backend
          or method produced the result.
        </p>
      </Card>

      <CodeBlock title="Response payload" code={docsQuickstartResponse} />
    </DocsShell>
  );
}
