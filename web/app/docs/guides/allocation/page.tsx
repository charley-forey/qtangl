import type { Metadata } from "next";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { tryScenarios } from "@/lib/demo-data";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

const allocationScenario = tryScenarios.find((s) => s.id === "allocation")!;

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/allocation",
  title: "Allocation guide",
  description: "Staffing and shift coverage payloads for workforce allocation.",
});

export default function AllocationGuidePage() {
  const fields: DocsFieldRow[] = [
    {
      name: "shifts[].id",
      type: "string",
      required: true,
      description: "Shift to cover.",
    },
    {
      name: "shifts[].requiredSkill",
      type: "string",
      description: "Skill required on the shift.",
    },
    {
      name: "staff[].name",
      type: "string",
      required: true,
      description: "Person identifier.",
    },
    {
      name: "staff[].skills",
      type: "string[]",
      description: "Certifications and roles.",
    },
    {
      name: "constraints[]",
      type: "string[]",
      description: "Coverage and fatigue rules.",
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/allocation"
        title="Allocation guide"
        description="Staffing allocation payload shapes."
      />
      <DocsShell
        title="Allocation guide"
        description="Shift grids, skills, and coverage rules — documented now, solver shipping next."
        pathname="/docs/guides/allocation"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="pilot" />

        <DocsCallout variant="honesty">
          <code className="font-mono text-white">type: allocation</code> returns{" "}
          <strong className="text-white">501</strong> on the live API today. Payloads below match
          the contract you can test in the sandbox UI.
        </DocsCallout>

        <DocsSection>
          <DocsHeading>When to use allocation</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Cover shifts with the right skills while minimizing overtime and respecting fatigue
            rules.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Request fields</DocsHeading>
          <DocsFieldTable fields={fields} />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Example payload</DocsHeading>
          <pre className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-black/40 p-4 text-xs text-[var(--color-gray-200)]">
            {JSON.stringify(allocationScenario.apiRequest, null, 2)}
          </pre>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
