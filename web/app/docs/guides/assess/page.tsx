import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/assess",
  title: "Assess workflow guide",
  description: "Run scan to report workflow: submit, poll, export, and verify readiness evidence.",
});

export default function AssessGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/assess"
      title="Assess workflow"
      description="Assess combines active discovery with reproducible reporting: scan, poll, export, and independently verify."
    >
      <DocsSection>
        <DocsHeading>Workflow overview</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Start a scan with <code className="font-mono text-white">POST /pqc/scan</code>.
          </li>
          <li>
            Check progress via <code className="font-mono text-white">GET /pqc/scan-status/{"{scan_id}"}</code>.
          </li>
          <li>
            Export evidence with <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}</code>.
          </li>
          <li>
            Validate signatures through <code className="font-mono text-white">GET /pqc/verify/{"{scan_id}"}</code> or{" "}
            <code className="font-mono text-white">POST /pqc/verify</code>.
          </li>
        </ol>
      </DocsSection>

      <DocsSection>
        <DocsHeading>1) Start the scan</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Use fixture mode for deterministic demos and live mode for external target inventory. For async scans, persist
          complete output to tenant history with{" "}
          <code className="font-mono text-white">POST /pqc/scan/{"{scan_id}"}/persist</code> so downstream workflows
          can consume a stable result set.
        </p>
        <DocsCallout variant="tip">
          Include internal scan metadata such as owner, environment, and change ticket in your scan payload so exports
          from <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}</code> remain audit ready.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>2) Poll until complete</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Polling should treat status transitions as stateful events, not just progress percentages. Once status reaches{" "}
          <code className="font-mono text-white">complete</code>, query{" "}
          <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}/availability</code> to pick the final
          output format (json, csv, cbom, pdf).
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>3) Produce report artifacts</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            JSON for machine workflows: <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}</code>
          </li>
          <li>
            CBOM evidence:{" "}
            <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}?format=cbom</code>
          </li>
          <li>
            Human-readable audit packet:{" "}
            <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}?format=pdf</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Interactive UI at /assess</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          The product page at{" "}
          <Link href="/assess" className="text-white underline underline-offset-4">
            /assess
          </Link>{" "}
          runs a four-step wizard (scenario → target → scope → run), then opens a tabbed readout:
          Executive, Compliance, Inventory, Remediation, Technical, and Evidence.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Auto-run demos:{" "}
            <code className="font-mono text-white">/assess?scenario=bank-tls-inventory&amp;autorun=1</code>
          </li>
          <li>
            Revisit a completed scan: <code className="font-mono text-white">/assess?scanId=…</code>
          </li>
          <li>
            Lead funnel: <Link href="/assess/mini" className="text-white underline">/assess/mini</Link> → full assess with autorun
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Board readout (15 minutes)</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Executive tab — readiness score, peer band, top vulnerability, Mosca timeline.</li>
          <li>Compliance tab — framework mapping and migration roadmap.</li>
          <li>Evidence tab — PDF + verify link for auditors.</li>
          <li>Upsell — drift preview and Monitor proposal (fixture or live diff).</li>
        </ol>
      </DocsSection>

      <DocsSection>
        <DocsHeading>4) Verify and share confidence</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Verification checks report content hash, signer identity, and optional transparency inclusion. Continue with
          the <Link href="/verify" className="text-white underline underline-offset-4">Verify tool</Link> and the{" "}
          <Link href="/docs/verify-spec" className="text-white underline underline-offset-4">Verify specification</Link>
          {" "}for offline controls in CI and customer assurance workflows.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
