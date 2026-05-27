import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsCodeTabs from "@/components/docs/DocsCodeTabs";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { apiPreviewRequest, apiPreviewResponse } from "@/lib/constants";
import { dataFormatGuides } from "@/lib/demo-data";
import {
  curlOptimize,
  javascriptFetch,
  pythonRequests,
} from "@/lib/docs/code-samples";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

const scheduleGuide = dataFormatGuides.find((g) => g.problemType === "schedule")!;

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/schedule",
  title: "Schedule guide",
  description: "Model construction and crew scheduling jobs with POST /optimize.",
});

export default function ScheduleGuidePage() {
  const fields: DocsFieldRow[] = scheduleGuide.fields.map((f) => ({
    name: f.name,
    type: "string | number",
    description: f.meaning,
    example: f.example,
  }));

  const tabs = [
    { id: "curl" as const, label: "curl", code: curlOptimize(apiPreviewRequest) },
    {
      id: "javascript" as const,
      label: "JavaScript",
      code: javascriptFetch("/optimize", "POST", apiPreviewRequest),
    },
    {
      id: "python" as const,
      label: "Python",
      code: pythonRequests("/optimize", "POST", apiPreviewRequest),
    },
    { id: "response" as const, label: "Response", code: apiPreviewResponse },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/schedule"
        title="Schedule guide"
        description="Construction and crew scheduling with Qtangl."
      />
      <DocsShell
        title="Schedule guide"
        description="Resequence tasks when crews, dependencies, and windows collide — CP-SAT baseline every job."
        pathname="/docs/guides/schedule"
        searchIndex={docsSearchIndex}
      >
        <div className="flex items-center gap-2">
          <DocsBadge status="ga" />
        </div>

        <DocsSection>
          <DocsHeading>When to use scheduling</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Use <code className="font-mono text-white">type: schedule</code> when work items,
            crews, and precedence rules must stay coherent on one timeline.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Request fields</DocsHeading>
          <DocsFieldTable fields={fields} />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Example</DocsHeading>
          <DocsCodeTabs tabs={tabs} />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Reading the plan</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            The solution array lists each task with startDay/endDay (or ISO timestamps in extended
            payloads). Check metrics.constraintViolations — production plans should read 0.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Troubleshooting</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>422 infeasible — relax crew windows or remove conflicting precedence.</li>
            <li>method classical — hybrid did not beat baseline; still a valid plan.</li>
            <li>Long runtime — reduce task count or split into planning horizons.</li>
          </ul>
        </DocsSection>

        <DocsCallout variant="tip">
          See also{" "}
          <Link href="/docs/data-formats" className="text-white underline underline-offset-4">
            Data formats
          </Link>{" "}
          and{" "}
          <Link href="/docs/reference/optimize" className="text-white underline underline-offset-4">
            POST /optimize reference
          </Link>
          .
        </DocsCallout>
      </DocsShell>
    </div>
  );
}
