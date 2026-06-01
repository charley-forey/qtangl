import type { Metadata } from "next";
import Link from "next/link";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { buildPageMetadata } from "@/lib/seo";
import { docsSearchIndex } from "@/lib/docs/search-index-export";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/integrations/siem-webhook-v2",
  title: "SIEM webhook v2 field dictionary",
  description: "Qtangl scan.complete webhook schema for Splunk, Datadog, and Elastic.",
});

const fields = [
  { name: "schemaVersion", type: "string", note: "Always qtangl-webhook-v2" },
  { name: "event", type: "string", note: "scan.complete" },
  { name: "tenantId", type: "string", note: "Tenant identifier" },
  { name: "scanId", type: "string", note: "Completed scan job ID" },
  { name: "targetDomain", type: "string", note: "Scanned target" },
  { name: "readinessScore", type: "number", note: "0–100 composite score" },
  { name: "readinessBand", type: "string", note: "Human band label" },
  { name: "verifyUrl", type: "string", note: "Public verify link for report signature" },
  { name: "evidenceZipUrl", type: "string", note: "Dashboard or bundle export link" },
  { name: "scanDiff", type: "object", note: "Delta vs previous scan when available" },
  { name: "alerts", type: "array", note: "Triggered alert rules (readiness drop, new Q-vuln, cert expiry)" },
  { name: "topFindings", type: "array", note: "Top degraded or new quantum-vulnerable assets" },
  { name: "message", type: "string", note: "Primary human-readable summary" },
];

export default function SiemWebhookV2Page() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/integrations/siem-webhook-v2"
        title="SIEM webhook v2"
        description="Webhook field dictionary for Monitor tier SIEM ingestion."
      />
      <DocsShell
        title="SIEM webhook v2"
        description="Field dictionary and signing headers for scan.complete notifications."
        pathname="/docs/integrations/siem-webhook-v2"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Sample payload</DocsHeading>
          <p className="text-sm leading-7 text-[var(--color-gray-300)]">
            Download a signed example:{" "}
            <Link href="/samples/webhook-v2-scan-complete.json" className="text-white underline">
              webhook-v2-scan-complete.json
            </Link>
            . Configure signing in Monitor alert settings (<code className="text-white">webhookSigningSecret</code>).
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Field dictionary</DocsHeading>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[var(--color-gray-300)]">
              <thead>
                <tr className="text-xs uppercase text-[var(--color-gray-500)]">
                  <th className="pb-2 pr-4">Field</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((row) => (
                  <tr key={row.name} className="border-t border-[var(--border-subtle)]">
                    <td className="py-2 pr-4 font-mono text-white">{row.name}</td>
                    <td className="py-2 pr-4">{row.type}</td>
                    <td className="py-2">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Splunk HEC (example)</DocsHeading>
          <pre className="overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`curl -X POST "$SPLUNK_HEC_URL/services/collector" \\
  -H "Authorization: Splunk $SPLUNK_TOKEN" \\
  -d '{"event": <paste qtangl webhook JSON>, "sourcetype": "qtangl:scan"}'`}
          </pre>
          <p className="mt-4 text-sm text-[var(--color-gray-400)]">
            See also{" "}
            <Link href="/docs/guides/monitor-setup" className="text-white underline">
              Monitor setup
            </Link>{" "}
            and{" "}
            <Link href="/trust" className="text-white underline">
              Trust center
            </Link>
            .
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
