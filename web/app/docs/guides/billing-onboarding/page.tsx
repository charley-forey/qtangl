import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/billing-onboarding",
  title: "Billing and onboarding guide",
  description: "Stripe self-serve monitor onboarding and onboarding-token based key bootstrap workflows.",
});

export default function BillingOnboardingGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/billing-onboarding"
      title="Billing and onboarding guide"
      description="Combine Stripe lifecycle events with public onboarding tokens to provision tenants safely."
    >
      <DocsSection>
        <DocsHeading>Self-serve monitor signup flow</DocsHeading>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Capture lead intent: <code className="font-mono text-white">POST /public/monitor-signup</code>
          </li>
          <li>
            Provision starter profile: <code className="font-mono text-white">POST /public/monitor-provision</code>
          </li>
          <li>Finalize tenant and key issuance in admin workflows.</li>
        </ol>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Stripe lifecycle synchronization</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Stripe events should be delivered to{" "}
          <code className="font-mono text-white">POST /public/stripe-webhook</code> and validated with
          <code className="font-mono text-white"> Stripe-Signature</code>. For customer self-service billing updates,
          expose <code className="font-mono text-white">POST /tenant/billing/portal</code> from authenticated tenant
          context.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Onboarding token bootstrap</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Validate invite tokens via{" "}
          <code className="font-mono text-white">GET /public/onboarding-key/{"{token}"}</code>, then mint tenant keys
          through admin issuance endpoints once user identity and entitlement checks pass.
        </p>
        <DocsCallout variant="tip">
          Keep onboarding tokens short-lived and one-time. Treat token resolution as a preflight check, not final auth.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Audit and support handoff</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Store webhook event ids and token redemption records in tenant audit trails so billing disputes and onboarding
          incidents can be resolved from immutable evidence.
        </p>
      </DocsSection>
    </GuidePageLayout>
  );
}
