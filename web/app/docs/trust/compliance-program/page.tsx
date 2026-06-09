import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/trust/compliance-program",
  title: "Compliance program",
  description: "Internal SOC 2 kickoff, pen-test scope, legal review, and insurance checklists surfaced for enterprise diligence.",
});

const programArtifacts = [
  {
    title: "SOC 2 Type I kickoff",
    summary: "Pre-observation checklist mapping Qtangl controls (RLS, audit log, key lifecycle) to CC-series evidence.",
    repoPath: "docs/compliance/soc2-type1-kickoff.md",
  },
  {
    title: "Penetration test scope",
    summary: "TH-001 SSRF/live-scan scope, metadata IP blocks, and remediation ticket linkage for external testers.",
    repoPath: "docs/compliance/pen-test-scope.md",
  },
  {
    title: "Legal review checklist",
    summary: "DPA/MSA/BAA review items, subprocessors, and marketing claim guardrails before enterprise contracts.",
    repoPath: "docs/compliance/legal-review-checklist.md",
  },
  {
    title: "Contracts & insurance checklist",
    summary: "Cyber insurance, vendor DPAs, and procurement artifacts required for regulated customers.",
    repoPath: "docs/compliance/contracts-insurance-checklist.md",
  },
] as const;

export default function ComplianceProgramPage() {
  return (
    <GuidePageLayout
      pathname="/docs/trust/compliance-program"
      title="Compliance program"
      description="Selected internal checklists summarized for security review — full markdown lives in the repository."
    >
      <DocsSection>
        <DocsHeading>Overview</DocsHeading>
        <DocsCallout variant="honesty">
          These artifacts support diligence conversations. They are not certifications or audit reports. Current assurance
          status is published on{" "}
          <Link href="/docs/trust/compliance-status" className="text-white underline underline-offset-4">
            Compliance status
          </Link>
          .
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Program artifacts</DocsHeading>
        <ul className="space-y-6">
          {programArtifacts.map((artifact) => (
            <li key={artifact.repoPath} className="rounded-2xl border border-[var(--border)] p-5">
              <p className="font-semibold text-white">{artifact.title}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{artifact.summary}</p>
              <p className="mt-3 text-xs text-[var(--color-gray-500)]">
                Repository path:{" "}
                <code className="font-mono text-[var(--color-gray-400)]">{artifact.repoPath}</code>
              </p>
              <a
                href={`https://github.com/qtangl/qtangl/blob/main/${artifact.repoPath}`}
                className="mt-3 inline-block text-sm text-white underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub →
              </a>
            </li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Request packaged evidence</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Enterprise customers may request CAIQ/SIG questionnaire responses, architecture summaries, and testing
          statements under NDA via{" "}
          <Link href="/access" className="text-white underline underline-offset-4">
            /access
          </Link>
          . See also{" "}
          <Link href="/docs/trust/legal" className="text-white underline underline-offset-4">
            Legal artifacts
          </Link>
          .
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
