import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/trust/incident-response",
  title: "Incident response",
  description: "Security incident handling summary, communication model, and business continuity / disaster recovery posture.",
});

const responsePhases: DocsFieldRow[] = [
  {
    name: "Detect and triage",
    type: "continuous",
    required: true,
    description: "Alerts, telemetry, and operator reports are triaged by severity and customer impact.",
  },
  {
    name: "Contain and eradicate",
    type: "immediate",
    required: true,
    description: "Access controls, credential rotation, and service isolation actions are executed to stop spread.",
  },
  {
    name: "Recover",
    type: "priority-based",
    required: true,
    description: "Services are restored in phased order with validation and monitoring before full return to normal.",
  },
  {
    name: "Post-incident review",
    type: "required",
    required: true,
    description: "Root cause, corrective actions, and prevention owners are documented and tracked to closure.",
  },
];

const bcpDrTargets: DocsFieldRow[] = [
  {
    name: "Critical API services",
    type: "target RTO <= 4h",
    required: true,
    description: "Priority restoration objective for core tenant access and scan lifecycle endpoints.",
  },
  {
    name: "Background processing",
    type: "target RTO <= 8h",
    required: true,
    description: "Queue and scheduler restoration target for asynchronous processing flows.",
  },
  {
    name: "Data durability",
    type: "target RPO <= 1h",
    required: true,
    description: "Recovery point objective for operational data under normal backup replication assumptions.",
  },
];

export default function IncidentResponseDocsPage() {
  return (
    <GuidePageLayout
      pathname="/docs/trust/incident-response"
      title="Incident response"
      description="Operational process for detecting, responding to, and recovering from security and availability incidents."
    >
      <DocsSection>
        <DocsHeading>Response summary</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Qtangl maintains a documented incident response process with assigned roles, escalation paths, and customer
          communication requirements. The process covers security events, service disruptions, and material data risk.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Incident lifecycle</DocsHeading>
        <DocsFieldTable fields={responsePhases} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>Customer communication</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Material incidents are communicated to affected customers with scope and timeline updates.</li>
          <li>Updates include what happened, current containment status, and required customer actions.</li>
          <li>Post-incident summaries include corrective actions and prevention commitments.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Business continuity and disaster recovery</DocsHeading>
        <DocsFieldTable fields={bcpDrTargets} />
        <DocsCallout variant="honesty" title="Target vs guarantee">
          RTO and RPO values on this page are operational targets used for planning and drills. They are not an
          unconditional guarantee for every incident scenario.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Vulnerability disclosure</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Report suspected vulnerabilities to{" "}
          <a href="mailto:security@qtangl.com" className="text-white underline underline-offset-4">
            security@qtangl.com
          </a>
          . Include reproduction steps, affected endpoints, and impact assessment. We acknowledge reports within two
          business days and coordinate disclosure timelines with reporters for validated findings.
        </p>
        <DocsCallout variant="info">
          Do not scan production tenants without authorization. Coordinated testing agreements are available for
          enterprise customers.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
