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
  path: "/docs/integrations/overview",
  title: "Integrations overview",
  description: "Enterprise integration patterns for cloud pulls, CLM, webhooks, and Jira push workflows.",
});

const integrationMatrix: DocsFieldRow[] = [
  {
    name: "Cloud inventory pull",
    type: "AWS, Azure, GCP",
    description: "Scheduled metadata pull for certificate and cryptographic inventory. Supports least-privilege credentials.",
  },
  {
    name: "Keyfactor",
    type: "CLM connector",
    description: "Imports certificate lifecycle metadata and ownership context to improve prioritization and assignment.",
  },
  {
    name: "CLM (general)",
    type: "REST + file ingest",
    description: "Brings external lifecycle status into Qtangl so remediation queues align with renewal and replacement programs.",
  },
  {
    name: "Webhooks",
    type: "Outbound event stream",
    description: "Pushes signed event payloads for SIEM, SOAR, and internal event buses with retry and replay support.",
  },
  {
    name: "Jira push",
    type: "Ticketing workflow",
    description: "Creates or updates remediation tickets from prioritized findings to keep security and platform teams aligned.",
  },
];

export default function IntegrationsOverviewPage() {
  return (
    <GuidePageLayout
      pathname="/docs/integrations/overview"
      title="Integrations overview"
      description="Connect Qtangl to your existing cloud, lifecycle, and incident workflow systems."
    >
      <DocsSection>
        <DocsHeading>Integration model</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Most enterprise teams run Qtangl in a hub-and-spoke model: inventory enters from cloud and lifecycle systems,
          findings are enriched and prioritized, then events and tickets flow out to operations systems. This keeps
          remediation ownership in existing tools while preserving a single risk view in Qtangl.
        </p>
        <DocsCallout variant="tip" title="Recommended rollout order">
          Start with read-only cloud and CLM ingestion, then enable signed webhooks, then automate Jira push when
          triage quality is stable.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Supported integration surfaces</DocsHeading>
        <DocsFieldTable fields={integrationMatrix} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>Cloud pull patterns</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Use dedicated read-only service identities scoped to inventory and metadata APIs.</li>
          <li>Tag environments and business units upstream so findings route correctly downstream.</li>
          <li>Schedule pulls to precede scan windows so targeting reflects current infrastructure state.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Lifecycle and key management connectors</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Keyfactor and other CLM integrations provide issuance context, owner data, and lifecycle timestamps. Qtangl
          uses this context to prioritize items that combine high cryptographic risk with near-term operational impact.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Outbound workflows: webhooks and Jira</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Webhooks are the primary event transport for SIEM and automation consumers. Jira push is designed for teams
          that need queue-level accountability and SLA tracking on top of scan findings.
        </p>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Continue with{" "}
          <Link href="/docs/integrations/webhooks" className="text-white underline underline-offset-4">
            webhook delivery and signing
          </Link>{" "}
          and{" "}
          <Link href="/docs/operations/conventions" className="text-white underline underline-offset-4">
            API conventions
          </Link>{" "}
          before moving to full production automation.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
