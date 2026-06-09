import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/monitor-workflow",
  title: "Monitor workflow guide",
  description: "Design continuous monitoring with schedules, drift detection, alerts, and webhook forwarding.",
});

export default function MonitorWorkflowGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/monitor-workflow"
      title="Monitor workflow"
      description="Monitor turns one-time scans into a continuous control: scheduled runs, drift awareness, and alert routing."
    >
      <DocsSection>
        <DocsHeading>Why monitor after assess</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          An initial scan gives a baseline. Monitor keeps that baseline alive by running scheduled assessments and
          raising alerts when crypto inventory or policy posture changes.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>1) Manage schedules</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Create schedule: <code className="font-mono text-white">POST /tenant/schedules</code>
          </li>
          <li>
            List active schedules: <code className="font-mono text-white">GET /tenant/schedules</code>
          </li>
          <li>
            Inspect run history:{" "}
            <code className="font-mono text-white">GET /tenant/schedules/{"{schedule_id}"}/runs</code>
          </li>
          <li>
            Pause or tune cadence:{" "}
            <code className="font-mono text-white">PATCH /tenant/schedules/{"{schedule_id}"}</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>2) Track drift and anomalies</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Use the public drift index for external attestation views and tenant analytics for internal operations.
          Combine <code className="font-mono text-white">GET /pqc/index/drift</code> with{" "}
          <code className="font-mono text-white">GET /tenant/drift-intel</code> to separate ecosystem-level movement
          from tenant-specific regressions.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>3) Route alerts and notifications</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Register destinations with <code className="font-mono text-white">POST /tenant/webhooks</code>, test
          delivery, then monitor dead-letter entries through{" "}
          <code className="font-mono text-white">GET /tenant/webhooks/dlq</code>. Re-send failed deliveries with{" "}
          <code className="font-mono text-white">POST /tenant/webhooks/replay</code>.
        </p>
        <DocsCallout variant="info">
          For SIEM pipelines, use signed webhook payloads and validate event integrity before ingestion. The integration
          schema is documented in{" "}
          <Link href="/docs/integrations/siem-webhook-v2" className="text-white underline underline-offset-4">
            SIEM webhook v2 docs
          </Link>
          .
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>4) Close the loop</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Feed high-severity drift into remediation by linking schedule runs to{" "}
          <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/remediation/automate</code>, then
          run <code className="font-mono text-white">POST /tenant/scans/{"{scan_id}"}/remediation/verify</code> to
          prove the control is restored.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
