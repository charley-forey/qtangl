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
  path: "/docs/integrations/webhooks",
  title: "Webhooks",
  description: "Webhook delivery model, signing headers, DLQ behavior, and replay controls.",
});

const eventFields: DocsFieldRow[] = [
  { name: "schemaVersion", type: "string", required: true, description: "Payload schema identifier. Current value: qtangl-webhook-v2." },
  { name: "event", type: "string", required: true, description: "Event name, such as scan.complete." },
  { name: "tenantId", type: "string", required: true, description: "Tenant identifier for multi-tenant routing in downstream systems." },
  { name: "scanId", type: "string", required: true, description: "Scan job id associated with the event." },
  { name: "readinessScore", type: "number", required: false, description: "Composite score from 0 to 100 when available for this event." },
  { name: "alerts[]", type: "array", required: false, description: "Triggered alert summaries to help SIEM correlation and prioritization." },
  { name: "verifyUrl", type: "string", required: false, description: "Canonical verification URL for report provenance checks." },
  { name: "message", type: "string", required: false, description: "Human-readable summary string intended for operator notifications." },
];

const signatureHeaders: DocsFieldRow[] = [
  { name: "X-Qtangl-Timestamp", type: "unix-seconds", required: true, description: "Server-side event timestamp used in signature input and replay windows." },
  { name: "X-Qtangl-Signature", type: "sha256=<hex>", required: true, description: "HMAC SHA-256 signature over `${timestamp}.${rawBody}` using your webhook secret." },
  { name: "X-Qtangl-Delivery-Id", type: "uuid", required: true, description: "Unique delivery id for deduplication and delivery traceability." },
];

export default function WebhooksDocsPage() {
  return (
    <GuidePageLayout
      pathname="/docs/integrations/webhooks"
      title="Webhooks"
      description="Reliable, signed event delivery for SIEM, SOAR, and ticketing automation."
    >
      <DocsSection>
        <DocsHeading>Event model</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Qtangl webhooks are push events emitted as integration state changes and scans complete. The canonical
          payload format is <code className="font-mono text-white">qtangl-webhook-v2</code>, which is designed for
          ingestion into Splunk, Datadog, Elastic, and internal event buses without custom translators.
        </p>
        <DocsCallout variant="info" title="Current primary event">
          <p>
            <code className="font-mono text-white">scan.complete</code> is the main GA event today. Additional
            lifecycle events are introduced with additive fields and announced in the changelog.
          </p>
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Payload fields (SIEM v2)</DocsHeading>
        <DocsFieldTable fields={eventFields} />
      </DocsSection>

      <DocsSection>
        <DocsHeading>HMAC signing and verification</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Configure a per-endpoint signing secret to receive authenticity headers on every delivery. Your receiver
          should compute HMAC SHA-256 from the raw request body and compare against
          <code className="ml-1 font-mono text-white">X-Qtangl-Signature</code> using constant-time comparison.
        </p>
        <DocsFieldTable fields={signatureHeaders} />
        <pre className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`expected = hmac_sha256(secret, "\${timestamp}.\${rawBody}")
if !constant_time_equal("sha256=" + expected, header_signature):
  reject 401`}
        </pre>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Delivery retries, DLQ, and replay</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Retries use exponential backoff for transient 5xx and network timeout failures.</li>
          <li>Permanent failures are moved to the webhook dead-letter queue (DLQ) with full delivery metadata.</li>
          <li>Operators can replay selected DLQ events after receiver fixes without rerunning source scans.</li>
          <li>Replay preserves original payload and issues a new delivery id for auditability.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Receiver hardening checklist</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Accept only HTTPS and enforce modern TLS policy at your edge.</li>
          <li>Validate timestamp skew and reject messages outside your tolerance window.</li>
          <li>Deduplicate on delivery id to make handler execution idempotent.</li>
          <li>Log request id, delivery id, and status for incident reconstruction.</li>
        </ul>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          For concrete field examples, see{" "}
          <Link href="/docs/integrations/siem-webhook-v2" className="text-white underline underline-offset-4">
            SIEM webhook v2 field dictionary
          </Link>
          .
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
