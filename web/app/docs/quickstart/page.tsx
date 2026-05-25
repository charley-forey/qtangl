import type { Metadata } from "next";

import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/DocsShell";
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
      description="This MVP flow shows the simplest possible optimization request: define a scheduling problem, send it to `/optimize`, and inspect the returned solution plan."
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-semibold text-white">1. Submit a job</h2>
        <p className="mt-4 text-sm leading-8 text-slate-300">
          Start with a small scheduling payload. Include a problem type, a list of
          tasks, and the constraints that must remain true in the final plan.
        </p>
      </div>

      <CodeBlock title="POST /optimize request" code={docsQuickstartRequest} />

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-2xl font-semibold text-white">2. Inspect the response</h2>
        <p className="mt-4 text-sm leading-8 text-slate-300">
          Qtangl returns a structured solution plus execution metadata. For the MVP,
          this lets developers review how the schedule was ordered and which backend
          or method produced the result.
        </p>
      </div>

      <CodeBlock title="Response payload" code={docsQuickstartResponse} />
    </DocsShell>
  );
}
