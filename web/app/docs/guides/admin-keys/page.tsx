import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/admin-keys",
  title: "Admin API key lifecycle guide",
  description: "Issue, inventory, rotate, and revoke tenant API keys through admin endpoints.",
});

export default function AdminKeysGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/admin-keys"
      title="Admin API key lifecycle"
      description="Admin APIs provide controlled key issuance and revocation for tenant automation."
    >
      <DocsSection>
        <DocsHeading>Lifecycle phases</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Create or identify tenant workspace.</li>
          <li>Issue scoped key for a workload or integration.</li>
          <li>Inventory key usage and rotate on schedule.</li>
          <li>Revoke compromised or expired credentials immediately.</li>
        </ol>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Core admin endpoints</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Create tenant: <code className="font-mono text-white">POST /admin/tenants</code>
          </li>
          <li>
            Issue tenant key:{" "}
            <code className="font-mono text-white">POST /admin/tenants/{"{tenant_id}"}/keys</code>
          </li>
          <li>
            List keys: <code className="font-mono text-white">GET /admin/tenants/{"{tenant_id}"}/keys</code>
          </li>
          <li>
            Revoke key: <code className="font-mono text-white">DELETE /admin/keys/{"{key_id}"}</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Rotation policy</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Use short-lived keys for CI and medium-lived keys for service integrations. Rotate before expiry and monitor
          active key inventory per tenant to avoid orphaned credentials.
        </p>
        <DocsCallout variant="warning">
          On suspected compromise, revoke first with{" "}
          <code className="font-mono text-white">DELETE /admin/keys/{"{key_id}"}</code>, then issue replacement. Do
          not rely on delayed rotation windows in incident scenarios.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
