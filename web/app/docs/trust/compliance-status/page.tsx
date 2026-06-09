import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/trust/compliance-status",
  title: "Compliance status",
  description: "Current assurance posture including SOC 2 readiness status, testing coverage, and framework mappings.",
});

const frameworkMapping: DocsFieldRow[] = [
  {
    name: "SOC 2 CC series",
    type: "in progress",
    required: true,
    description: "Controls are being documented and operationalized; no active certification claim is made.",
  },
  {
    name: "ISO 27001 style controls",
    type: "partial mapping",
    required: true,
    description: "Selected controls are mapped internally for policy and evidence organization.",
  },
  {
    name: "NIST CSF functions",
    type: "reference mapping",
    required: true,
    description: "Program-level controls are tagged to identify, protect, detect, respond, and recover functions.",
  },
  {
    name: "CAIQ/SIG responses",
    type: "available by request",
    required: true,
    description: "Questionnaire responses can be shared during enterprise diligence under appropriate agreements.",
  },
];

export default function ComplianceStatusDocsPage() {
  return (
    <GuidePageLayout
      pathname="/docs/trust/compliance-status"
      title="Compliance status"
      description="A transparent view of what is in place now and what remains on the roadmap."
    >
      <DocsSection>
        <DocsHeading>Current assurance status</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Qtangl maintains a documented security program with policy, access control, logging, and operational
          procedures. Enterprise trust artifacts are available during procurement and security review cycles.
        </p>
        <DocsCallout variant="honesty" title="Honest status statement">
          Qtangl is <strong className="text-white">not currently claiming completed SOC 2 certification</strong> on
          this page. SOC 2 Type I readiness and audit preparation are in progress.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>SOC 2 and external testing</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>SOC 2 control implementation and evidence collection are active internal workstreams.</li>
          <li>Independent penetration testing is planned on a recurring cadence for production deployments.</li>
          <li>Critical findings from internal or external tests are tracked through remediation SLAs.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Framework mapping coverage</DocsHeading>
        <DocsFieldTable fields={frameworkMapping} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>How to request evidence</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Enterprise customers can request current policy summaries, architecture documentation, and testing statements
          through the support channel. Some artifacts require NDA or commercial status before release.
        </p>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          See also{" "}
          <Link href="/docs/trust/data-residency" className="text-white underline underline-offset-4">
            data residency
          </Link>{" "}
          and{" "}
          <Link href="/docs/trust/incident-response" className="text-white underline underline-offset-4">
            incident response
          </Link>
          .
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
